ĐỒ ÁN CÔNG NGHỆ THIẾT KẾ WEB NÂNG CAO ĐỀ TÀI SHOP BÁN ĐỒ ĐIỆN TỬ
*Để chạy api thêm dòng lệnh ở file PROGRAM.CS ở mục WEBAPI

//add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy.WithOrigins("http://127.0.0.1:5500")
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

*thêm ở dưới :
var key = builder.Configuration["JwtSettings:SecretKey"];

*kéo xuống dưới tìm:

var app = builder.Build();

app.UseCors("AllowFrontend"); // thêm dòng này

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.Run();