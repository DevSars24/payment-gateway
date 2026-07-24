using PaymentGateway.Api.Config;
using PaymentGateway.Api.Middleware;
using PaymentGateway.Api.Repositories;
using PaymentGateway.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// 1. Register Configuration Sections
builder.Services.Configure<RazorpaySettings>(builder.Configuration.GetSection(RazorpaySettings.SectionName));
builder.Services.Configure<MongoDbSettings>(builder.Configuration.GetSection(MongoDbSettings.SectionName));

// 2. Register Repositories (Data Access Layer - Scoped)
builder.Services.AddScoped<IPaymentRepository, PaymentRepository>();
builder.Services.AddScoped<IProductRepository, ProductRepository>();

// 3. Register Services (Business Domain Layer - Scoped)
builder.Services.AddScoped<IPaymentService, PaymentService>();
builder.Services.AddScoped<IWebhookService, WebhookService>();
builder.Services.AddScoped<IProductService, ProductService>();

// 4. Add Controllers
builder.Services.AddControllers();

// 5. Add OpenAPI / Swagger Documentation
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "Razorpay Payment Gateway API (.NET 8 Clean Architecture)", Version = "v1" });
});

// 6. Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowClientOrigin", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// 7. Configure Middleware Pipeline
app.UseMiddleware<RequestCorrelationMiddleware>();
app.UseMiddleware<GlobalExceptionMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowClientOrigin");
app.UseAuthorization();
app.MapControllers();

app.Run();
