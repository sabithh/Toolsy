# PostgreSQL with PostGIS Setup Guide

## For Windows Development

PostGIS requires GDAL (Geospatial Data Abstraction Library) which can be complex to set up on Windows.

### Option 1: SQLite for Local Development (Recommended for now)
- We've configured the backend to use SQLite locally
- Geolocation features will work but without full PostGIS optimization
- When deploying to Railway, it will use PostgreSQL with PostGIS

### Option 2: Full PostGIS Setup on Windows

If you want full PostGIS locally:

1. **Install PostgreSQL with PostGIS**
   - Download PostgreSQL from: https://www.postgresql.org/download/windows/
   - During installation, include the PostGIS extension via Stack Builder
   
2. **Install OS Geo4W** (provides GDAL)
   - Download from: https://trac.osgeo.org/osgeo4w/
   - Install and note the installation path

3. **Set Environment Variables**
   ```powershell
   # Add to your system PATH:
   C:\OSGeo4W64\bin
   
   # Add these environment variables:
   GDAL_LIBRARY_PATH = C:\OSGeo4W64\bin\gdal304.dll
   GEOS_LIBRARY_PATH = C:\OSGeo4W64\bin\geos_c.dll
   ```

4. **Create Database**
   ```sql
   CREATE DATABASE toolsy;
   \c toolsy
   CREATE EXTENSION postgis;
   ```

5. **Update .env**
   ```
   USE_POSTGIS=True
   DB_NAME=toolsy
   DB_USER=postgres
   DB_PASSWORD=your_password
   DB_HOST=localhost
   DB_PORT=5432
   ```

## Current Configuration

For simplicity, we're using SQLite for local development.
The production deployment on Railway will use PostgreSQL with PostGIS automatically.
