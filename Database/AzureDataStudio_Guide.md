# מדריך התחברות למסד הנתונים באמצעות Azure Data Studio

## שלב 1: הורדה והתקנה של Azure Data Studio

### אופציה A: הורדה מאתר Microsoft (מומלץ)
1. פתח דפדפן וגש ל: https://aka.ms/azuredatastudio
2. לחץ על "Download for macOS"
3. לאחר ההורדה, פתח את הקובץ `.zip` שנמצא ב-Downloads
4. גרור את `Azure Data Studio.app` לתיקיית Applications
5. פתח את Azure Data Studio מתיקיית Applications

### אופציה B: התקנה דרך Homebrew (אם יש לך)
```bash
brew install --cask azure-data-studio
```

## שלב 2: התחברות למסד הנתונים

### צעד 1: פתח Azure Data Studio
פתח את Azure Data Studio מהתיקייה Applications.

### צעד 2: צור חיבור חדש
1. במסך הפתיחה, לחץ על **"New Connection"** (או כפתור ה-+ בצד)
2. אם אין לך מסך פתיחה, לחץ על **"File" → "New Connection"** או `Cmd+Shift+P` וחפש "New Connection"

### צעד 3: מלא את פרטי החיבור

**בטופס החיבור, מלא את הפרטים הבאים:**

```
Connection Type: Microsoft SQL Server

Server: localhost,1433
  (או: 127.0.0.1,1433)

Authentication Type: SQL Login

User name: sa

Password: YourStrong@Passw0rd

Database: DogBarbershopDB
  (אופציונלי - אפשר להשאיר ריק ולבחור אחר כך)

Server Group: <Default>
  (או צור קבוצה חדשה)

Name (optional): Dog Barbershop Local
  (זה השם שיופיע ברשימת החיבורים)
```

### צעד 4: הגדרות נוספות (אופציונלי)
לחץ על **"Advanced"** או **"Show more options"** כדי לראות אפשרויות נוספות:

- **Trust Server Certificate**: סמן את זה (✓) - זה חשוב!
- **Encrypt**: אפשר להשאיר על "Optional"

### צעד 5: התחבר
לחץ על **"Connect"** בתחתית הטופס.

## שלב 3: בדיקה שהחיבור עובד

אחרי ההתחברות, אתה אמור לראות:
- בחלון השמאלי: את מסד הנתונים `DogBarbershopDB`
- תוכל לפתוח את הטבלאות: `Users`, `Appointments`, `AppointmentTypes`, `AppointmentHistory`

## שלב 4: הרצת שאילתות

### אופציה 1: שאילתה חדשה
1. לחץ על **"New Query"** (או `Cmd+N`)
2. הקלד את השאילתה:
```sql
USE DogBarbershopDB;
GO

SELECT * FROM vw_AppointmentsWithDetails;
```
3. לחץ על **"Run"** (או `Cmd+Enter`)

### אופציה 2: שימוש בקובץ SQL
1. לחץ על **"File" → "Open File"**
2. בחר את הקובץ: `Database/Scripts/ViewAppointments.sql`
3. לחץ על **"Run"** (או `Cmd+Enter`)

## שלב 5: צפייה בנתונים

### לראות את כל התורים:
```sql
USE DogBarbershopDB;
GO

SELECT * FROM vw_AppointmentsWithDetails
ORDER BY ScheduledDate DESC;
```

### לראות את כל הטבלאות:
1. בחלון השמאלי, פתח את `DogBarbershopDB`
2. פתח את `Tables`
3. לחץ ימני על טבלה (למשל `Appointments`)
4. בחר **"Select Top 1000"** או **"Edit Data"**

## פתרון בעיות

### בעיה: "Cannot connect to server"
**פתרון:**
1. ודא ש-SQL Server רץ ב-Docker:
   ```bash
   docker ps | grep sqlserver
   ```
2. אם לא רץ, התחל אותו:
   ```bash
   docker start sqlserver
   ```

### בעיה: "Login failed for user 'sa'"
**פתרון:**
- ודא שהסיסמה נכונה: `YourStrong@Passw0rd`
- ודא שהקונטיינר רץ: `docker ps`

### בעיה: "Database 'DogBarbershopDB' does not exist"
**פתרון:**
1. התחבר בלי לבחור מסד נתונים (השאר ריק)
2. הרץ את הסקריפט: `Database/Scripts/CreateTables.sql`
3. או צור את המסד ידנית:
   ```sql
   CREATE DATABASE DogBarbershopDB;
   ```

### בעיה: "Certificate error"
**פתרון:**
- בטופס החיבור, תחת "Advanced", סמן **"Trust Server Certificate"**

## טיפים שימושיים

### שמירת החיבור
אחרי ההתחברות הראשונה, החיבור נשמר. בפעם הבאה:
1. לחץ על האייקון של החיבורים בחלון השמאלי
2. בחר את החיבור "Dog Barbershop Local"
3. החיבור יתחבר אוטומטית

### עריכת נתונים ישירות
1. לחץ ימני על טבלה
2. בחר **"Edit Data"**
3. תוכל לערוך, להוסיף ולמחוק שורות ישירות

### ייצוא נתונים
1. לחץ ימני על תוצאות של שאילתה
2. בחר **"Save as CSV"** או **"Save as JSON"**

## קיצורי מקשים שימושיים

- `Cmd+N` - שאילתה חדשה
- `Cmd+Enter` - הרצת שאילתה
- `Cmd+K, Cmd+C` - הערה על שורה
- `Cmd+/` - הערה/ביטול הערה
- `Cmd+S` - שמירת קובץ

## סיכום - פרטי החיבור

```
Server: localhost,1433
Username: sa
Password: YourStrong@Passw0rd
Database: DogBarbershopDB
Trust Server Certificate: ✓ (חשוב!)
```

---

**עזרה נוספת?** אם יש בעיות, בדוק את הלוגים:
```bash
docker logs sqlserver
```

