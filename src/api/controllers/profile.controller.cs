using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ScanEats.Domain.Entities;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Collections.Generic;
using ScanEats.Application.Interfaces;

namespace ScanEats.Api.Controllers
{
    /// <summary>
    /// Controller for managing user dietary profiles.
    ///
    /// <para><b>Models used and their properties:</b></para>
    /// <list type="bullet">
    ///   <item>
    ///     <term><see cref="Profiles"/></term>
    ///     <description>
    ///         <list type="table">
    ///             <item><term>Id</term><description>int (Primary key, inherited from <see cref="BaseEntity"/>)</description></item>
    ///             <item><term>UserId</term><description>string? (User identifier, inherited from <see cref="BaseEntity"/>)</description></item>
    ///             <item><term>Name</term><description>string? (Profile name)</description></item>
    ///             <item><term>Age</term><description>int (User's age)</description></item>
    ///             <item><term>Gender</term><description>string? (User's gender)</description></item>
    ///             <item><term>Weight</term><description>string? (User's weight)</description></item>
    ///             <item><term>Goals</term><description>string? (Dietary or health goals)</description></item>
    ///             <item><term>BirthDate</term><description>DateTime (User's birth date)</description></item>
    ///             <item><term>CreatedDate</term><description>DateTime (Profile creation date, inherited from <see cref="BaseEntity"/>)</description></item>
    ///             <item><term>UpdatedDate</term><description>DateTime (Profile last update date, inherited from <see cref="BaseEntity"/>)</description></item>
    ///         </list>
    ///     </description>
    ///   </item>
    /// </list>
    ///
    /// <para><b>Service used:</b> <see cref="IProfileService"/></para>
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ProfileController : ControllerBase
    {
        private readonly IProfileService _profileService;

        /// <summary>
        /// Initializes a new instance of the <see cref="ProfileController"/> class.
        /// </summary>
        /// <param name="profileService">Service for profile management operations.</param>
        public ProfileController(IProfileService profileService)
        {
            _profileService = profileService;
        }

        /// <summary>
        /// Retrieves all profiles associated with the currently authenticated user.
        /// </summary>
        /// <returns>
        /// A list of <see cref="Profiles"/> objects belonging to the user.
        /// </returns>
        /// <remarks>
        /// The user is identified via the JWT token claims.
        /// </remarks>
        // GET: api/profile
        [HttpGet]
        public async Task<ActionResult<List<Profiles>>> GetProfiles()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var profiles = await _profileService.GetProfilesByUserIdAsync(userId);
            return Ok(profiles);
        }

        /// <summary>
        /// Retrieves a specific profile by its ID, if it belongs to the authenticated user.
        /// </summary>
        /// <param name="id">The profile's unique identifier.</param>
        /// <returns>
        /// The <see cref="Profiles"/> object if found; otherwise, 404 Not Found.
        /// </returns>
        /// <remarks>
        /// Ensures the profile belongs to the current user before returning.
        /// </remarks>
        // GET: api/profile/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Profiles>> GetProfile(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var profile = await _profileService.GetProfileByIdAsync(id, userId);
            if (profile == null)
                return NotFound();
            return Ok(profile);
        }

        /// <summary>
        /// Creates a new profile for the authenticated user.
        /// </summary>
        /// <param name="profile">The profile data to create (<see cref="Profiles"/>).</param>
        /// <returns>
        /// The created <see cref="Profiles"/> object.
        /// </returns>
        /// <remarks>
        /// The UserId is set automatically from the authenticated user's claims.
        /// </remarks>
        // POST: api/profile
        [HttpPost]
        public async Task<IActionResult> CreateProfile([FromBody] Profiles profile)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            profile.UserId = userId;
            await _profileService.CreateProfileAsync(profile);
            return Ok(profile);
        }

        /// <summary>
        /// Updates an existing profile if it belongs to the authenticated user.
        /// </summary>
        /// <param name="id">The profile's unique identifier.</param>
        /// <param name="profile">The updated profile data (<see cref="Profiles"/>).</param>
        /// <returns>
        /// 204 No Content if successful; 404 Not Found if the profile does not exist or does not belong to the user.
        /// </returns>
        /// <remarks>
        /// Only the owner of the profile can update it.
        /// </remarks>
        // PUT: api/profile/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProfile(int id, [FromBody] Profiles profile)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var updated = await _profileService.UpdateProfileAsync(id, userId, profile);
            if (!updated)
                return NotFound();
            return NoContent();
        }

        /// <summary>
        /// Deletes a profile by its ID if it belongs to the authenticated user.
        /// </summary>
        /// <param name="id">The profile's unique identifier.</param>
        /// <returns>
        /// 204 No Content if successful; 404 Not Found if the profile does not exist or does not belong to the user.
        /// </returns>
        /// <remarks>
        /// Only the owner of the profile can delete it.
        /// </remarks>
        // DELETE: api/profile/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProfile(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var deleted = await _profileService.DeleteProfileAsync(id, userId);
            if (!deleted)
                return NotFound();
            return NoContent();
        }
    }
}