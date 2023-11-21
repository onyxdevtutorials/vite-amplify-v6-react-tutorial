// import { AddProduct } from "./index";
import { ListProducts } from "../components";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div>
      <div>
        <Link to="/add">Add a Product</Link>
      </div>
      <ListProducts />
      {/* <AddProduct /> */}
    </div>
  );
};
export default Landing;
