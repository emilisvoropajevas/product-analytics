import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { AxiosError } from "axios"
import { toast } from "sonner"

import { Users, type UserCreate, type UserUpdate } from "../client-axios"
import { extractErrorMessage } from "../utils"

const useUsers = () => {
    const queryClient = useQueryClient()

    const usersQuery = useQuery({
        queryKey: ["users"],
        queryFn: async () => {
            const response = await Users.getUsers()
            return response.data
        },
    })

    const createUserMutation = useMutation({
        mutationFn: async (data: UserCreate) => {
            const response = await Users.createUser({ body: data })
            return response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] })
            toast.success("User created")
        },
        onError: (err) => toast.error(extractErrorMessage(err as AxiosError)),
    })

    const updateUserMutation = useMutation({
        mutationFn: async ({ userId, data }: { userId: string, data: UserUpdate }) => {
            const response = await Users.updateUser({ path: { user_id: userId }, body: data })
            return response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] })
            toast.success("User updated")
        },
        onError: (err) => toast.error(extractErrorMessage(err as AxiosError)),
    })

    const deleteUserMutation = useMutation({
        mutationFn: async (userId: string) => {
            const response = await Users.deleteUser({ path: { user_id: userId } })
            return response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] })
            toast.success("User deleted")
        },
        onError: (err) => toast.error(extractErrorMessage(err as AxiosError)),
    })

    return { usersQuery, createUserMutation, updateUserMutation, deleteUserMutation }
}

export default useUsers