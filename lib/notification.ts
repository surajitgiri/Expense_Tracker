import {prisma} from "./prisma"

type props = {
    userId: string
    message: string
    type?: string
}
export async function createNotification({userId , message , type = "info"}:props){
    return prisma.notification.create({
        data: {
            userId,
            message,
            type
        }
    })
}