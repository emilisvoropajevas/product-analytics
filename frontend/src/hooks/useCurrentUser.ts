import { useQuery } from "@tanstack/react-query";
import { Login, type UserPublic } from "../client-axios"

const useCurrentUser = () => {
    const currentUserQuery = useQuery<UserPublic>({
        queryKey: ["currentUser"],
        queryFn: async () => {
            const response = await Login.loginTestToken()
            return response.data as UserPublic
        },
    })
    return { currentUserQuery }
}

export default useCurrentUser