import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { licenseNotificationGeneratorService } from "@/services/licenseNotificationGenerator.service";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const result =
      await licenseNotificationGeneratorService.checkAndGenerateNotifications(
        userId,
      );
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error in license check API:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
