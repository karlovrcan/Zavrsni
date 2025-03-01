import React from "react";
import Layout from "../../Layout/Layout";
import SongBar from "../MasterBar/SongBar";
import { useGlobalContext } from "../../states/Content";

const Search = () => {
  const {filteredSongs} = useGlobalContext();
  return (
    <Layout>
      <div className="secondary_bg px-4 py-4 rounded-lg z-index:1 mr-3">
        <div className="px-3 pt-4 flex justify-between items-center mb-4 ">
          <span className="font-bold text-2xl  hover:underline">
            Browse all
          </span>
        </div>
        {filteredSongs?.length > 0 && <div className="px-3 flex gap-6 grid grid-cols-4">
          <CategoryCard
            title={"Live Events"}
            img={"/src/assets/images/live-events_category-image.jpg"}
            color={"purple"}
          />
          <CategoryCard
            title={"Rap Caviar"}
            img={"/src/assets/images/rap.jpg"}
            color={"green"}
          />
          <CategoryCard
            title={"Rock"}
            img={"/src/assets/images/rock.jpg"}
            color={"red"}
          />
          <CategoryCard
            title={"Science Now"}
            img={"/src/assets/images/science.jpg"}
            color={"blue"}
          />

          <CategoryCard
            title={"Rap Caviar"}
            img={"/src/assets/images/rap.jpg"}
            color={"green"}
          />
          <CategoryCard
            title={"Rock"}
            img={"/src/assets/images/rock.jpg"}
            color={"red"}
          />
          <CategoryCard
            title={"Science Now"}
            img={"/src/assets/images/science.jpg"}
            color={"blue"}
          />
          <CategoryCard
            title={"Live Events"}
            img={"/src/assets/images/live-events_category-image.jpg"}
            color={"purple"}
          />
          <CategoryCard
            title={"Rap Caviar"}
            img={"/src/assets/images/rap.jpg"}
            color={"green"}
          />
          <CategoryCard
            title={"Rock"}
            img={"/src/assets/images/rock.jpg"}
            color={"red"}
          />
          <CategoryCard
            title={"Science Now"}
            img={"/src/assets/images/science.jpg"}
            color={"blue"}
          />
          <CategoryCard
            title={"Live Events"}
            img={"/src/assets/images/live-events_category-image.jpg"}
            color={"purple"}
          />
          <CategoryCard
            title={"Rap Caviar"}
            img={"/src/assets/images/rap.jpg"}
            color={"green"}
          />
          <CategoryCard
            title={"Rock"}
            img={"/src/assets/images/rock.jpg"}
            color={"red"}
          />
          <CategoryCard
            title={"Science Now"}
            img={"/src/assets/images/science.jpg"}
            color={"blue"}
          />
        </div>}
      </div>
      <SongBar />
    </Layout>
  );
};

const CategoryCard = ({ title, img, color }) => {
  return (
    <div
      className="
        relative w-[21rem] h-[12rem] rounded-md overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-200
      "
      style={{ backgroundColor: color }}
    >
      <h3 className="text-white text-lg font-semibold p-3 z-10">{title}</h3>
      <img
        src={img}
        alt=""
        className="
          absolute 
          bottom-0 
          right-0 
          w-[11rem]  
          rounded-md
          rotate-[35deg] 
          translate-x-1/4 
          translate-y-1/4 
          object-cover
        "
      />
    </div>
  );
};
export default Search;
