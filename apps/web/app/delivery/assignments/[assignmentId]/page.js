import AssignmentDetail from "./AssignmentDetail";
export const metadata = { title: "Delivery details" };
export default function AssignmentDetailPage({ params }) { return <AssignmentDetail id={params.assignmentId} />; }
