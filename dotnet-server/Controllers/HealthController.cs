using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using PaymentGateway.Api.DTOs;

namespace PaymentGateway.Api.Controllers;

[ApiController]
[Route("api")]
public class HealthController : ControllerBase
{
    [HttpGet("health")]
    [HttpGet("ready")]
    public IActionResult GetHealth()
    {
        var process = Process.GetCurrentProcess();
        var healthInfo = new
        {
            status = "UP",
            timestamp = DateTime.UtcNow.ToString("o"),
            system = new
            {
                uptimeSeconds = Math.Floor((DateTime.UtcNow - process.StartTime.ToUniversalTime()).TotalSeconds),
                memory = new
                {
                    workingSetMB = (process.WorkingSet64 / 1024.0 / 1024.0).ToString("F2"),
                    privateMemoryMB = (process.PrivateMemorySize64 / 1024.0 / 1024.0).ToString("F2")
                },
                dotnetVersion = Environment.Version.ToString(),
                os = Environment.OSVersion.ToString()
            }
        };

        return Ok(ApiResponseDto<object>.Ok(healthInfo, "System health status"));
    }
}
