# הסבר על חיבור ל-SQL Server דרך Docker

## איך זה עובד?

### 1. מה זה Docker?
Docker הוא כלי שרץ SQL Server בתוך "קונטיינר" (container) - זה כמו מכונה וירטואלית קטנה שרצה על המחשב שלך.

### 2. איך SQL Server רץ ב-Docker?

כשאתה מריץ SQL Server ב-Docker:
- **הקונטיינר** = מכונה וירטואלית קטנה שרצה SQL Server
- **Port 1433** = הפורט שדרכו מתחברים ל-SQL Server
- **localhost:1433** = הכתובת שמחברת את האפליקציה שלך ל-SQL Server

### 3. איך האפליקציה מתחברת?

בקובץ `appsettings.json` יש connection string:
```
Server=localhost,1433;Database=DogBarbershopDB;User Id=sa;Password=YourStrong@Passw0rd
```

זה אומר:
- **Server=localhost,1433** → מתחבר ל-SQL Server שרץ על localhost בפורט 1433
- **Database=DogBarbershopDB** → שם מסד הנתונים
- **User Id=sa** → שם המשתמש (System Administrator)
- **Password=YourStrong@Passw0rd** → הסיסמה

### 4. איך לבדוק אם SQL Server רץ?

```bash
# לראות את כל הקונטיינרים שרצים
docker ps

# לראות את הקונטיינר של SQL Server
docker ps | grep sqlserver
```

### 5. איך להתחיל/לעצור את SQL Server?

**התחלה:**
```bash
docker start sqlserver
```

**עצירה:**
```bash
docker stop sqlserver
```

**התחלה מחדש:**
```bash
docker restart sqlserver
```

**אם יש לך docker-compose.yml:**
```bash
# התחלה
docker-compose up -d

# עצירה
docker-compose down

# עצירה + מחיקת הנתונים
docker-compose down -v
```

### 6. איך להתחבר למסד הנתונים?

#### דרך SQL Server Management Studio (SSMS):
1. פתח SSMS
2. Server name: `localhost,1433`
3. Authentication: SQL Server Authentication
4. Login: `sa`
5. Password: `YourStrong@Passw0rd`

#### דרך Azure Data Studio:
1. פתח Azure Data Studio
2. New Connection
3. Server: `localhost,1433`
4. Authentication Type: SQL Login
5. Username: `sa`
6. Password: `YourStrong@Passw0rd`

#### דרך שורת פקודה (sqlcmd):
```bash
docker exec -it sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P YourStrong@Passw0rd
```

### 7. איך לראות את הנתונים?

השתמש בקובץ `Database/Scripts/ViewAppointments.sql` שיצרנו, או הרץ את השאילתות הבאות:

```sql
USE DogBarbershopDB;
GO

-- לראות את כל התורים
SELECT * FROM vw_AppointmentsWithDetails;
```

### 8. איפה הנתונים נשמרים?

הנתונים נשמרים ב-volume של Docker בשם `sqlserver_data`. זה אומר שהנתונים נשארים גם אחרי שסוגרים את הקונטיינר.

### 9. איך לראות את הלוגים של SQL Server?

```bash
docker logs sqlserver
```

### 10. בעיות נפוצות

**הקונטיינר לא רץ:**
```bash
docker start sqlserver
```

**Port 1433 תפוס:**
- בדוק אם יש SQL Server אחר שרץ: `docker ps`
- או שנה את הפורט ב-docker-compose.yml

**לא יכול להתחבר:**
- ודא שהקונטיינר רץ: `docker ps`
- בדוק את הסיסמה ב-appsettings.json
- נסה להתחבר דרך SSMS קודם

## פקודות שימושיות

```bash
# לראות את כל הקונטיינרים (כולל עצורים)
docker ps -a

# לראות את הלוגים
docker logs sqlserver

# להיכנס לקונטיינר
docker exec -it sqlserver bash

# לעצור את הקונטיינר
docker stop sqlserver

# להתחיל את הקונטיינר
docker start sqlserver

# למחוק את הקונטיינר (זה לא מוחק את הנתונים!)
docker rm sqlserver

# לראות את ה-volumes
docker volume ls
```

