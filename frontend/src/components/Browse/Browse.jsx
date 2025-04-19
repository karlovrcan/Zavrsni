import React from "react";
import { useNavigate } from "react-router-dom";

const LOCAL_CATEGORIES = [
  {
    id: "pop",
    label: "Pop",
    searchQuery:
      "pop+top+charts+radio+mainstream+hits+catchy+billboard+dance pop",
    color: "#ff5e5e",
  },
  {
    id: "rock",
    label: "Rock",
    searchQuery:
      "rock+alternative+grunge+metal+punk+indie rock+garage+hard rock+classic rock+rock ballads+80s hits+ 90s hits+70s hits+ 60s hits",
    color: "#8b5cf6",
  },
  {
    id: "party",
    label: "Party",
    searchQuery:
      "party+dance+club+bangers+festival+hits+turnup+night out+dj+edm+psytrance+minimal tech+2010s edm",
    color: "#f59e0b",
  },
  {
    id: "chill",
    label: "Chill",
    searchQuery:
      "chill+ambient+lofi+relax+smooth+calm+downtempo+instrumental+laid back+study",
    color: "#3b82f6",
  },
  {
    id: "mood",
    label: "Mood",
    searchQuery:
      "mood+vibe+emotions+feelings+atmosphere+romantic+melancholy+moody+sensual",
    color: "#6366f1",
  },
  {
    id: "workout",
    label: "Workout",
    searchQuery:
      "workout+gym+fitness+training+cardio+energy+power+run+beast mode+pump",
    color: "#22c55e",
  },
  {
    id: "hiphop",
    label: "Hip-Hop",
    searchQuery:
      "hiphop+rap+trap+drill+urban+freestyle+bars+beats+boom bap+90s hip hop+00s hip hop+rap caviar+west coast+east coast+global+rap UK+",
    color: "#e11d48",
  },
  {
    id: "rnb",
    label: "R&B",
    searchQuery:
      "rnb+neo-soul+soul+slowjam+urban+smooth+r&b+groove+bedroom+r&b x+r&b weekly",
    color: "#a855f7",
  },
  {
    id: "sleep",
    label: "Sleep",
    searchQuery:
      "sleep+ambient+soothing+relaxing+calm+night+deep sleep+meditation+zen+white noise+dreamy music+jazz for sleep+classical+natural sleep+white noice+brown noice+ pink noice+deep sleep noice+calming nature",
    color: "#0ea5e9",
  },
  {
    id: "jazz",
    label: "Jazz",
    searchQuery:
      "jazz+saxophone+trumpet+instrumental+swing+smooth jazz+cool jazz+bebop+fusion+big band+bluesy+improvisation+latin jazz+standards+new orleans jazz",
    color: "#db2777",
  },
  {
    id: "classical",
    label: "Classical",
    searchQuery:
      "classical+orchestra+piano+violin+baroque+romantic+beethoven+mozart+bach+string quartet+chamber music+symphony+concerto+opera+composer+instrumental",
    color: "#818cf8",
  },
  {
    id: "reggae",
    label: "Reggae",
    searchQuery:
      "reggae+dub+roots+caribbean+rasta+ska+island vibes+rocksteady+dancehall+bob marley+laid back+positive vibes+one love+jamaican+irie",
    color: "#22d3ee",
  },

  {
    id: "country",
    label: "Country",
    searchQuery:
      "country+folk+americana+southern+bluegrass+outlaw country+honky tonk+country pop",
    color: "#f97316",
  },
  {
    id: "decades",
    label: "Decades",
    searchQuery:
      "all out 70s+all out 80s+ all out 90s+ all out 00s+80s+90s+00s+70s+60s+retro+throwback+classic+nostalgia+oldies+vintage",
    color: "#d946ef",
  },
  {
    id: "indie",
    label: "Indie",
    searchQuery:
      "indie+alt+bedroom pop+underground+indie rock+indie pop+lofi+college rock+DIY",
    color: "#14b8a6",
  },
  {
    id: "dance",
    label: "Dance/Electronic",
    searchQuery:
      "edm+dance+electronic+house+techno+club+electro+deep house+trance+future bass+minimal tech",
    color: "#10b981",
  },
  {
    id: "latin",
    label: "Latin",
    searchQuery:
      "latin+reggaeton+bachata+salsa+latino+trap latino+urbano+merengue+latin pop",
    color: "#f43f5e",
  },
  {
    id: "new",
    label: "New Releases",
    searchQuery:
      "new+latest+fresh+just released+trending+hot right now+discover+premiere+latest rap+ latest pop",
    color: "#a3e635",
  },
  {
    id: "kpop",
    label: "K-pop",
    searchQuery:
      "kpop+korean+idol+girl group+boy band+hallyu+jpop+dance pop+anime+asia",
    color: "#ec4899",
  },
  {
    id: "home",
    label: "At Home",
    searchQuery:
      "home+relax+study+focus+background+cozy+ambient+acoustic+instrumental",
    color: "#0d9488",
  },
];

const BrowsePage = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <h2 className="text-white text-3xl font-bold mb-4">Browse all</h2>
      <div className="grid grid-cols-3 gap-4">
        {LOCAL_CATEGORIES.map((cat) => (
          <div
            key={cat.id}
            onClick={() =>
              navigate(
                `/search?query=${encodeURIComponent(
                  cat.searchQuery
                )}&source=browse`
              )
            }
            className="p-6 rounded-lg hover:scale-105 transition cursor-pointer"
            style={{ backgroundColor: cat.color }}
          >
            <h3 className="text-white font-bold text-lg">{cat.label}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BrowsePage;
