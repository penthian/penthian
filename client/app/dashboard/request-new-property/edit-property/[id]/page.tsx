import EditRequestNewProperty from "./edit-property"

type Props = {
  params: {
    id: string
  }
}

function Page({ params }: Props) {
  return (
    <EditRequestNewProperty id={params.id} />
  )
}

export default Page