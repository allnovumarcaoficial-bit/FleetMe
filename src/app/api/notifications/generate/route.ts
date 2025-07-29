import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { notificationManager } from "@/services/notificationManager.service";
import "@/services/checkers/license.checker"; // Import for side-effect: registers the checker

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const notifications =
      await notificationManager.generateAllNotifications(userId);
    return NextResponse.json(
      {
        message: "Notifications generated successfully.",
        notifications: notifications,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error in notification generation API:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
