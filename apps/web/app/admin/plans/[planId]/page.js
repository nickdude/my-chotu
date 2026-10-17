import PlanForm from "../PlanForm";
export const metadata = { title: "Edit Plan" };
export default function EditPlanPage({ params }) { return <PlanForm planId={params.planId} />; }
