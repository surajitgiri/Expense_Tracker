import { prisma } from "./prisma"

type Props = {
  userId: string
  message: string
  type?: string
}

export async function createNotification({ userId, message, type = "info" }: Props) {
  return prisma.notification.create({
    data: {
      userId,
      message,
      type,
    },
  })
}
