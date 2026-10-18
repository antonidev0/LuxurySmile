import { useNavigate } from "react-router-dom";
import Nav from "../components/Nav";
import Main from "../components/Main"; 

export const Home = () => {
    return (
        <>
            <div className="bg-slate-100 font-Bodoni">
                <Nav />
                <Main />
                
            </div>
        </>
    );
};

export default Home;