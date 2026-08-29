import { NextResponse } from "next/server";
import { sequelize } from "@/app/database/database";

export async function GET() {
  try {
    await sequelize.authenticate();

    return NextResponse.json({
      success: true,
      message: "Database connected",
    });
  } catch (error) {
    console.error("Database connection error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Database connection failed",
      },
      {
        status: 500,
      },
    );
  }
}
