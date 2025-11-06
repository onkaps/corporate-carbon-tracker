-- CreateTable
CREATE TABLE "companies" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "industry" VARCHAR(100),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employees" (
    "id" SERIAL NOT NULL,
    "employee_id" VARCHAR(50) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "email" VARCHAR(200) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "department" VARCHAR(100),
    "position" VARCHAR(100),
    "is_admin" BOOLEAN NOT NULL DEFAULT false,
    "company_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "carbon_footprints" (
    "id" SERIAL NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "body_type" VARCHAR(20),
    "sex" VARCHAR(10),
    "diet" VARCHAR(20),
    "shower_frequency" VARCHAR(30),
    "social_activity" VARCHAR(20),
    "transport" VARCHAR(20),
    "vehicle_type" VARCHAR(20),
    "vehicle_km" DOUBLE PRECISION,
    "air_travel" VARCHAR(30),
    "waste_bag_size" VARCHAR(20),
    "waste_bag_count" INTEGER,
    "recycle_paper" BOOLEAN NOT NULL DEFAULT false,
    "recycle_plastic" BOOLEAN NOT NULL DEFAULT false,
    "recycle_glass" BOOLEAN NOT NULL DEFAULT false,
    "recycle_metal" BOOLEAN NOT NULL DEFAULT false,
    "heating_energy" VARCHAR(20),
    "cooking_microwave" BOOLEAN NOT NULL DEFAULT false,
    "cooking_oven" BOOLEAN NOT NULL DEFAULT false,
    "cooking_grill" BOOLEAN NOT NULL DEFAULT false,
    "cooking_airfryer" BOOLEAN NOT NULL DEFAULT false,
    "cooking_stove" BOOLEAN NOT NULL DEFAULT false,
    "energy_efficiency" VARCHAR(20),
    "daily_tv_pc" DOUBLE PRECISION,
    "internet_daily" DOUBLE PRECISION,
    "grocery_bill" DOUBLE PRECISION,
    "clothes_monthly" INTEGER,
    "total_footprint" DOUBLE PRECISION NOT NULL,
    "travel_footprint" DOUBLE PRECISION,
    "energy_footprint" DOUBLE PRECISION,
    "waste_footprint" DOUBLE PRECISION,
    "diet_footprint" DOUBLE PRECISION,
    "calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,

    CONSTRAINT "carbon_footprints_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "companies_name_key" ON "companies"("name");

-- CreateIndex
CREATE UNIQUE INDEX "employees_employee_id_key" ON "employees"("employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "employees_email_key" ON "employees"("email");

-- CreateIndex
CREATE INDEX "employees_company_id_idx" ON "employees"("company_id");

-- CreateIndex
CREATE INDEX "employees_email_idx" ON "employees"("email");

-- CreateIndex
CREATE INDEX "carbon_footprints_employee_id_idx" ON "carbon_footprints"("employee_id");

-- CreateIndex
CREATE INDEX "carbon_footprints_month_year_idx" ON "carbon_footprints"("month", "year");

-- CreateIndex
CREATE INDEX "carbon_footprints_calculated_at_idx" ON "carbon_footprints"("calculated_at");

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carbon_footprints" ADD CONSTRAINT "carbon_footprints_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;
