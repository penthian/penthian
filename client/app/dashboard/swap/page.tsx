import Swap from "@/app/components/Swap"
import UserDashboard from "@/app/components/UserDashboard"

const Page = () => {
    return (
        <UserDashboard>
            <div className="px-4 max-w-5xl w-full mx-auto space-y-6">
                <Swap />
            </div>
        </UserDashboard>
    )
}

export default Page
