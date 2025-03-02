import React from "react";
import Layout from "../../Layout/Layout";
import SongBar from "../MasterBar/SongBar";
import { useGlobalContext } from "../../states/Content";
import Card from "../Card/Card";

const Search = () => {
  const { filteredSongs } = useGlobalContext();

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-155px)] overflow-hidden custom-scrollbar">
        <div className="secondary_bg px-4 py-4 rounded-lg  flex-grow overflow-y-auto pb-[100px] mr-1">
          <div className="px-3 pt-4 flex justify-between items-center mb-4">
            <span className="font-bold text-2xl hover:underline">
              Browse all
            </span>
          </div>

          {/* Show search results or categories */}
          {filteredSongs?.length > 0 ? (
            <div className="px-3 grid grid-cols-4 gap-4">
              {filteredSongs.map((song) => (
                <Card key={song.id} song={song} />
              ))}
            </div>
          ) : (
            <div className="px-3 grid grid-cols-3 gap-4">
              {[
                {
                  title: "Live Events",
                  img: "/src/assets/images/live-events_category-image.jpg",
                  color: "purple",
                },
                {
                  title: "Rap Caviar",
                  img: "/src/assets/images/rap.jpg",
                  color: "green",
                },
                {
                  title: "Rock",
                  img: "/src/assets/images/rock.jpg",
                  color: "red",
                },
                {
                  title: "Science Now",
                  img: "/src/assets/images/science.jpg",
                  color: "blue",
                },
                {
                  title: "Live Events",
                  img: "/src/assets/images/live-events_category-image.jpg",
                  color: "purple",
                },
                {
                  title: "Rap Caviar",
                  img: "/src/assets/images/rap.jpg",
                  color: "green",
                },
                {
                  title: "Rock",
                  img: "/src/assets/images/rock.jpg",
                  color: "red",
                },
                {
                  title: "Science Now",
                  img: "/src/assets/images/science.jpg",
                  color: "blue",
                },
                {
                  title: "Live Events",
                  img: "/src/assets/images/live-events_category-image.jpg",
                  color: "purple",
                },
                {
                  title: "Rap Caviar",
                  img: "/src/assets/images/rap.jpg",
                  color: "green",
                },
                {
                  title: "Rock",
                  img: "/src/assets/images/rock.jpg",
                  color: "red",
                },
                {
                  title: "Science Now",
                  img: "/src/assets/images/science.jpg",
                  color: "blue",
                },
                {
                  title: "Live Events",
                  img: "/src/assets/images/live-events_category-image.jpg",
                  color: "purple",
                },
                {
                  title: "Rap Caviar",
                  img: "/src/assets/images/rap.jpg",
                  color: "green",
                },
                {
                  title: "Rock",
                  img: "/src/assets/images/rock.jpg",
                  color: "red",
                },
                {
                  title: "Science Now",
                  img: "/src/assets/images/science.jpg",
                  color: "blue",
                },
                {
                  title: "Live Events",
                  img: "/src/assets/images/live-events_category-image.jpg",
                  color: "purple",
                },
                {
                  title: "Rap Caviar",
                  img: "/src/assets/images/rap.jpg",
                  color: "green",
                },
                {
                  title: "Rock",
                  img: "/src/assets/images/rock.jpg",
                  color: "red",
                },
                {
                  title: "Science Now",
                  img: "/src/assets/images/science.jpg",
                  color: "blue",
                },
              ].map((category, index) => (
                <CategoryCard
                  key={index}
                  title={category.title}
                  img={category.img}
                  color={category.color}
                />
              ))}
            </div>
          )}
        </div>

        {/* SongBar stays fixed at the bottom */}
        <SongBar />
      </div>
    </Layout>
  );
};

// ✅ Category Card remains unchanged
const CategoryCard = ({ title, img, color }) => {
  return (
    <div
      className="relative w-full max-w-[350px] h-[11rem] rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-200"
      style={{ backgroundColor: color }}
    >
      <h3 className="text-white text-2xl font-semibold p-3">{title}</h3>
      <img
        src={img}
        alt={title}
        className="absolute rounded-md bottom-[-30px] right-[-15px] w-[130px] h-auto rotate-[40deg] object-cover shadow-lg"
      />
    </div>
  );
};

export default Search;
