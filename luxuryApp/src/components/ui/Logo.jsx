import { Image } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import logo from "../../assets/images/logo.png";

const Logo = ({ h = { base: 8, md: 10 }, invert = false, to = "/" }) => (
  <Link to={to} aria-label="LuxurySmile, ir al inicio">
    <Image src={logo} alt="LuxurySmile" h={h} w="auto" filter={invert ? "invert(1)" : undefined} />
  </Link>
);

export default Logo;
