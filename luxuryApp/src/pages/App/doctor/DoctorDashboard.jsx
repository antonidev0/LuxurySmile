import { useNavigate } from "react-router-dom";
import Sidebar from "../../../components/dashboard/Sidebar";

export const DoctorDashboard = () => {
    return (
        <>
            <div className="bg-slate-100 font-Bodoni">
                <h1>CACATUA</h1>
            </div>
               <Sidebar />

        </>
    );
};

export default DoctorDashboard;