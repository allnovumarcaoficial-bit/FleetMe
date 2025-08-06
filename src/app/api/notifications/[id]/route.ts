import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PATCH(
  request: Request,
  context: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  const { id } = await Promise.resolve(context.params); // Workaround for Next.js warning

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const updatedNotification = await prisma.notification.update({
      where: {
        id,
        userId: session.user.id, // Ensure users can only update their own notifications
      },
      data: {
        read: true,
      },
    });
    return NextResponse.json(updatedNotification);
  } catch (error) {
    console.error(`Error updating notification ${id}:`, error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  const { id } = await Promise.resolve(context.params); // Workaround for Next.js warning

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.notification.delete({
      where: {
        id,
        userId: session.user.id, // Ensure users can only delete their own notifications
      },
    });
    return NextResponse.json(
      { message: "Notification deleted" },
      { status: 200 },
    );
  } catch (error) {
    console.error(`Error deleting notification ${id}:`, error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
