# מערכת תורים למספרת כלבים

מערכת ניהול תורים מלאה למספרת כלבים, המאפשרת ללקוחות להזמין, לערוך ולמחוק תורים, עם מערכת הנחות ללקוחות ותיקים.

## טכנולוגיות

### Backend
- **.NET 9.0** - ASP.NET Core Web API
- **Entity Framework Core** - ORM לעבודה עם בסיס הנתונים
- **SQL Server** - בסיס נתונים
- **JWT Authentication** - מערכת אימות

### Frontend
- **React** - UI Library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Axios** - HTTP client

### Database
- **Microsoft SQL Server**
- **Stored Procedures** - לוגיקה ברמת בסיס הנתונים
- **Views** - הצגת נתונים מותאמת

## מבנה הפרויקט

```
DogBarbershopAppointmentsSystem/
├── Backend/
│   └── DogBarbershopAPI/          # .NET Web API
├── Frontend/
│   └── dog-barbershop-client/     # React Application
└── Database/
    └── Scripts/                    # SQL Scripts
```

## דרישות

### Backend
- .NET 9.0 SDK ומעלה
- SQL Server

### Frontend
- Node.js 18+ 
- npm או yarn

## התקנה והרצה

### Backend
```bash
cd Backend/DogBarbershopAPI
dotnet restore
dotnet run
```

### Frontend
```bash
cd Frontend/dog-barbershop-client
npm install
npm run dev
```

## פונקציונליות

- ✅ מערכת אימות (Login/Register)
- ✅ ניהול תורים (Create, Read, Update, Delete)
- ✅ סינון לפי תאריך ושם לקוח
- ✅ חישוב הנחות ללקוחות תיקים (10% למי שיש לו יותר מ-3 תורים)
- ✅ סוגי תספורת שונים (כלב קטן/בינוני/גדול) עם מחירים וזמנים שונים
- ✅ הגבלות אבטחה (לקוח יכול לערוך/למחוק רק את התורים שלו)
- ✅ פופ-אפ עם פרטי תור מלאים

## אבטחת מידע

- 🌐 **CORS ממוקד** – שרת ה-API מאפשר קריאות רק מכתובות ה-Frontend (`http://localhost:5173`, `http://localhost:3000`) עם תמיכה ב-Credentials.
- 🔐 **JWT Access Token** – מונפק לאחר התחברות ונשמר ב-Local Storage בצד הלקוח. אין Refresh Token נפרד; לקוח נדרש להתחבר מחדש עם תפוגת ה-Token.
- 🚦 **Rate Limiting** – נתיב `api/auth/*` מוגבל ל-5 בקשות לדקה לכל כתובת IP באמצעות Rate Limiter מובנה של ASP.NET Core.

## רישיון

פרויקט זה נוצר כחלק ממטלת בית לראיון עבודה.

