-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Activity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "stravaId" BIGINT NOT NULL,
    "goalId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "distance" REAL NOT NULL,
    "movingTime" INTEGER NOT NULL,
    "totalElevationGain" REAL NOT NULL DEFAULT 0,
    "averageSpeed" REAL NOT NULL DEFAULT 0,
    "maxSpeed" REAL NOT NULL DEFAULT 0,
    "averageHeartrate" REAL,
    "maxHeartrate" REAL,
    "calories" REAL,
    "startDate" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Activity_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "Goal" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Activity" ("createdAt", "distance", "goalId", "id", "movingTime", "startDate", "stravaId", "type") SELECT "createdAt", "distance", "goalId", "id", "movingTime", "startDate", "stravaId", "type" FROM "Activity";
DROP TABLE "Activity";
ALTER TABLE "new_Activity" RENAME TO "Activity";
CREATE UNIQUE INDEX "Activity_stravaId_key" ON "Activity"("stravaId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
