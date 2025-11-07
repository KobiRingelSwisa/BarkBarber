# מסמך pages – תיעוד מלא של מערכת ניהול התורים למספרת כלבים

## תקציר מנהלים

- **מטרה**: מערכת מקצה לקצה לניהול תורים במספרת כלבים, הכוללת רישום והתחברות משתמשים, הזמנה ועריכת תורים, חישוב הנחות ללקוחות חוזרים וניהול סוגי טיפולים.
- **מבנה**: פתרון תלת-שכבתי (Frontend React, Backend ASP.NET Core Web API, בסיס נתונים SQL Server) עם תקשורת באמצעות REST ו-JSON.
- **קהל יעד**: בעלי המספרה וצוות הקבלה (לצפייה בכלל התורים) ולקוחות קצה (לניהול התורים האישיים).
- **עקרונות מובילים**: אבטחה באמצעות JWT, אחידות מודלים באמצעות DTOs, אחסון מחירים סטטי למניעת שינוי רטרואקטיבי, חוויית משתמש עשירה וטיפול בצד הלקוח בעזרת הקשר אימות וקריאות אסינכרוניות.

## תרשים ארכיטקטורה לוגית

```
Frontend (React + TypeScript + Vite)
    |
    |  HTTPS + JWT
    v
Backend (ASP.NET Core 9 Web API)
    |-- Controllers (Auth, Appointments, AppointmentTypes)
    |-- Services (AuthService, AppointmentService, PasswordService)
    |-- DTOs + Models + EF Core DbContext
    |
    v
SQL Server (טבלאות, Stored Procedures, Views)
```

## רכיבי המערכת המרכזיים

### Frontend – `Frontend/dog-barbershop-client`

- **טכנולוגיות**: React עם TypeScript, Vite, Tailwind CSS, Axios.
- **ניהול מדינה**: `AuthContext` מאחסן את פרטי המשתמש וה-Token ומספק פעולות `login`, `register`, `logout`. קבוע כחלק מ-`AuthProvider` שעוטף את האפליקציה (`main.tsx`).
- **שכבת שירותים**: קבצי `services/*.ts` מרכזים את הקריאות ל-API ומטפלים בבניית הפרמטרים, בקרת שגיאות והזרקת ה-Token לכותרות.
- **בקרת גישה**: `ProtectedRoute.tsx` אינו מצורף אך באמצעות ההקשר נבדק האם המשתמש מחובר לצורך ניווט לעמודי ניהול (למשל `Appointments.tsx`).
- **UI Components**: רכיבים ייעודיים (`Button`, `Card`, `Badge`, `AppointmentModal` וכו’) מאפשרים חוויית משתמש עקבית והפרדת אחריות מהלוגיקה.
- **עמודים עיקריים**:
  - `Home.tsx`: הצגת דף שיווקי ומידע על השירות.
  - `Login.tsx` ו-`Register.tsx`: טפסים מאובטחים להירשם/להתחבר.
  - `Appointments.tsx`: רכיב עשיר לניהול תורים כולל סינון, פתיחת מודאלים, טפסי יצירה/עריכה, הצגת מחירים עם הנחות, שינוי סטטוס ומחיקה מבוקרת.
- **שמירת Token**: מתבצעת ב-`localStorage`. Interceptor (`api.ts`) מוסיף את כותרת `Authorization` אוטומטית ומנתב ל-`/login` אם קיבלנו קוד 401.

### Backend – `Backend/DogBarbershopAPI`

- **טכנולוגיות**: ASP.NET Core .NET 9, Entity Framework Core, JWT Bearer Authentication, Swagger.
- **מבנה**:
  - `Program.cs`: רישום שירותים (DbContext, Services), הפעלת אימות JWT, הגדרת CORS ל-React, הפעלת Swagger בסביבת פיתוח.
  - `Controllers`: שכבת REST שמזריקה את השירותים וממפה DTOs מבקשות/לתגובות.
  - `Services`: לוגיקה עסקית ממוקדת.
  - `DTOs`: מגדירים חוזים חיצוניים ונתוני קלט/פלט.
  - `Models`: מייצגים ישויות EF Core.
  - `Data/DogBarbershopDbContext`: תצורת הישויות, קשרים ואינדקסים.
- **שירותים מרכזיים**:
  - `AuthService`: רישום והתחברות, צ’יפים של Bcrypt דרך `PasswordService`, הנפקת JWT עם תביעות `NameIdentifier` ו-`Name`.
  - `AppointmentService`: יצירה/עדכון/מחיקה/שאילתא של תורים, כולל קריאה ל-`sp_CalculateAppointmentPrice` דרך `SqlCommand` לחישוב הנחות, בדיקות תאריך, בדיקת הרשאות ושמירת מחירים בישויות.
  - `PasswordService`: Hashing/Verification באמצעות BCrypt.Net.
- **בקרות (Controllers)**:
  - `AuthController`: נקודות קצה `POST /api/auth/register` ו-`POST /api/auth/login` עם טיפול בשגיאות בסיסי.
  - `AppointmentsController`: קריאות CRUD + שינוי סטטוס, עם בדיקות הרשאה לעדכון/מחיקה ולוגיקה למניעת שינוי של תורים שהושלמו או תורים ליום הנוכחי.
  - `AppointmentTypesController`: חשיפה של סוגי הטיפול ללקוח.
- **אבטחה**:
  - JWT עם מפתח סימטרי שמוזן ב-`appsettings.json` (או בסוד סביבתי). נבדק Issuer/Audience/Key.
  - מדיניות CORS מתירה גישה רק מכתובות `http://localhost:5173` ו-`http://localhost:3000`.
  - כל נקודות הקצה תחת `AppointmentsController` מוגנות על ידי `[Authorize]`.
- **תצורה**:
  - `appsettings.json` מכיל מחרוזת חיבור `DefaultConnection` וערכי JWT. יש להחליף סיסמאות בסביבה אמיתית ולהשתמש ב-User Secrets/ENV.
  - `appsettings.Development.json` ניתן להגדרה מקומית (לא סופק בקוד הנוכחי).
- **אבחון ותיעוד**: Swagger מחולל תיעוד API ומאפשר בדיקה ידנית. יש הגדרת Security Scheme מסוג Bearer לקבלת Token.

### Database – `Database/Scripts`

- **תשתית**: SQL Server 2022 בתוך Docker (`docker-compose.yml`). Volume `sqlserver_data` משמר נתונים.
- **תהליך הקמה**:
  1. `docker-compose up -d` להעלאת השרת.
  2. הרצת `Scripts/CreateTables.sql` ליצירת טבלאות.
  3. `SeedData.sql` לאכלוס ראשוני (משתמשים, סוגי תספורות, תורים לדוגמה).
  4. `StoredProcedures.sql` ליצירת פרוצדורות (`sp_CalculateAppointmentPrice`).
  5. `Views.sql` ליצירת צפיות (`vw_AppointmentsWithDetails` וכו’).
- **טבלאות עיקריות**:
  - `Users`: משתמשים עם `Username` ייחודי, `PasswordHash`, `FirstName`, `CreatedAt`.
  - `AppointmentTypes`: שם טיפול, משך בדקות, מחיר (Decimal), אינדקס ייחודי לפי שם.
  - `Appointments`: תורים פעילים עם שדות סטטוס (`Pending/Completed/Cancelled`), `BasePrice`, `DiscountAmount`, `FinalPrice`, קשרים ל-Users ול-AppointmentTypes.
  - `AppointmentHistory`: היסטוריה של תורים שהושלמו, שומר מחיר סופי והנחות.
- **Stored Procedure מרכזית** – `sp_CalculateAppointmentPrice`:
  - מקבלת UserId, AppointmentTypeId, CreatedAt.
  - מבצעת ספירה של תורים שהושלמו לפני התור הנוכחי כדי לקבוע הנחה של 10% מהפעם הרביעית ואילך.
  - מחזירה `@BasePrice`, `@DiscountAmount`, `@FinalPrice` דרך פרמטרים מסוג OUTPUT.
- **Views ו-Scripts נוספים**:
  - `vw_AppointmentsWithDetails` מציגה נתונים מאוחדים לצורך דוחות.
  - `ViewAppointments.sql` מספק שאילתות מוכנות לבדיקה (לפי סטטוס, משתמש, היסטוריה, ספירות).

## זרימות ליבה במערכת

### 1. רישום והתחברות

1. המשתמש שולח `POST /api/auth/register` עם `username`, `password`, `firstName`.
2. `AuthController` מאציל ל-`AuthService`:
   - בדיקה האם המשתמש קיים.
   - Hash לסיסמה ושמירת משתמש חדש (`Users` + EF).
   - הנפקת JWT עם תוקף 24 שעות.
3. ה-Frontend שומר את ה-Token ואת פרטי המשתמש ב-`localStorage`.
4. בכניסה (`POST /api/auth/login`) נעשה אימות מול הסיסמה המוצפנת והנפקת Token חדש.

### 2. יצירה ועדכון תורים

1. הלקוח מאומת ומפעיל את `appointmentService.createAppointment`.
2. Axios מוסיף Authorization Header עם Bearer Token.
3. `AppointmentsController.CreateAppointment` מאמת קלט (תאריך עתידי, סוג תור).
4. `AppointmentService.CreateAppointmentAsync`:
   - מאחזר מחיר בסיסי של סוג התור.
   - קורא ל-`sp_CalculateAppointmentPrice` כדי לקבוע הנחה.
   - שומר את התור עם מחירים קבועים (Base/Discount/Final) למניעת חישוב מחדש עתידי.
5. תגובת JSON מוחזרת ללקוח ומעודכנת בטבלת התורים במסך.
6. עדכון (`PUT /api/appointments/{id}`) מאמת בעלות, סטטוס, ותאריך; החישוב מחדש משתמש ב-`CreatedAt` המקורי כדי לשמור עקביות בהנחות.

### 3. שינוי סטטוס ומחיקה

- `PATCH /api/appointments/{id}/status`: מאפשר לסמן תור כהושלם כאשר שעתו חלפה או לבטל (בעל התור בלבד). השירות דואג לאכוף ערכי סטטוס חוקיים.
- `DELETE /api/appointments/{id}`: נבדק שהתור שייך למשתמש, לא נקבע להיום, ואז נמחק.

### 4. שליפת נתונים

- `GET /api/appointments`: מחזיר את כל התורים (לפי דרישת המטלה – תצוגה כוללת לצוות).
- פרמטרים `date` ו-`customerName` מאפשרים סינון בצד השרת; ב-Frontend קיים UI מתקדם לסינון.
- `GET /api/appointments/{id}/details`: מחזיר `AppointmentDetailResponse` עם `UserCreatedAt` לצורך הצגה במודאל.
- `GET /api/appointmenttypes`: מספק את קטלוג השירותים לטפסים.

## שכבת DTOs וחוזי API

- **בקשות**:
  - `CreateAppointmentRequest`: `AppointmentTypeId`, `ScheduledDate` (ISO8601).
  - `UpdateAppointmentRequest`: אותם שדות לעדכון.
  - `UpdateStatusRequest`: `Status`.
  - `LoginRequest`, `RegisterRequest`.
- **תגובות**:
  - `AppointmentResponse`: נתוני תור רגיל + מחירים.
  - `AppointmentDetailResponse`: כולל מידע נוסף על הלקוח וזמן ההרשמה.
  - `AuthResponse`: `Token`, `UserId`, `Username`, `FirstName`.
- שימוש ב-DTOs מגן על המודלים הפנימיים ומקל על תמיכה בגרסאות עתידיות.

## דגשים ארכיטקטוניים

- **הפרדת שכבות**: Controllers דקים, שירותים אחראים ללוגיקה עסקית, EF Core מטפל בגישה לנתונים.
- **עקביות מחירים**: שמירת Base/Discount/Final בישויות מאפשרת הצגת היסטוריית מחירים אמינה גם אם מחיר בסיסי משתנה בעתיד.
- **הנחת נאמנות**: ממומשת ברמת בסיס הנתונים כדי לשמור על עקביות ולמנוע מרוצים (Race Conditions).
- **אבטחת סיסמאות**: שימוש ב-BCrypt לחיזוק.
- **התמודדות עם אזורי זמן**: בצד הלקוחות נעשה שימוש ב-UTC (`convertLocalDateTimeToISO`) כדי להתאים לדרישות ה-API.
- **UX**: רכיבים חזותיים ו-Transitions מספקים חוויית משתמש איכותית. התצוגה ממוקדת בלקוחות אך מתאימה גם לצוות.

## תצורה והרצה

### משתני סביבה רלוונטיים

- Backend (`appsettings.json`):
  ```json
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost,1433;Database=DogBarbershopDB;User Id=sa;Password=YourStrong@Passw0rd"
  },
  "Jwt": {
    "Key": "<SECRET>",
    "Issuer": "DogBarbershopAPI",
    "Audience": "DogBarbershopClient"
  }
  ```
- Frontend (`.env` לדוגמה):
  ```
  VITE_API_URL=http://localhost:5139/api
  ```

### שלבים להרצה מקומית

1. להריץ את SQL Server: `docker-compose up -d`.
2. להריץ סקריפטים ליצירת בסיס הנתונים (באמצעות Azure Data Studio או sqlcmd).
3. Backend: `cd Backend/DogBarbershopAPI`, ואז `dotnet restore` + `dotnet run`.
4. Frontend: `cd Frontend/dog-barbershop-client`, `npm install`, `npm run dev`.
5. להיכנס לכתובת `http://localhost:5173` ולבצע רישום/התחברות.

## ניטור, לוגים ובדיקות

- **לוגים**: ASP.NET Core מספק לוגים בסיסיים כברירת מחדל. ניתן להרחיב ל-Serilog או Application Insights בעתיד.
- **בדיקות**: הפרויקט אינו כולל כרגע בדיקות יחידה/אינטגרציה. הרחבה מומלצת:
  - בדיקות שירותים עם InMemoryDatabase ל-EF.
  - בדיקות UI עם Testing Library לזרימות טפסים.
- **ניטור SQL**: `docker logs sqlserver` לקבלת אינדיקציה על בעיות בחישוב הנחות.

## אבטחה ושיקולים עתידיים

- החלפת סיסמת SA ומפתח JWT לפני פריסה לסביבה ייצורית.
- הוספת Refresh Tokens או הארכת חיי Token עם לוגיקת חידוש.
- הפרדת הרשאות בין תפקידי משתמשים (למשל לקוחות מול אדמין).
- הטמעת Rate Limiting ו-Logging לניסיונות כושלים.
- תמיכה בשפות נוספות/רב-מטבע ותמיכה בזמני אזורים שונים.

## שיפורים מומלצים להמשך

- **התראות**: שליחת מייל/SMS לפני התור באמצעות Azure Functions או שירות דומה.
- **תזמון מתקדם**: מניעת חפיפה בין תורים על בסיס משך הטיפול.
- **דוחות ניהול**: הרחבת `Views.sql` עם סטטיסטיקות הכנסות והנחות.
- **CI/CD**: הגדרת Pipeline לפריסת Backend ו-Frontend אוטומטיים.
- **בדיקות אוטומטיות**: הוספת ענף בדיקות ברמת API ו-E2E (למשל Playwright).

---

המסמך מספק סקירה מעמיקה על מרכיבי המערכת, הזרימות והטכנולוגיות. הוא נועד לשמש כבסיס ידע עבור מרצים, בודקים ומפתחים שיצטרפו לפרויקט וזקוקים להבנה מלאה של המבנה וההתנהגות.
