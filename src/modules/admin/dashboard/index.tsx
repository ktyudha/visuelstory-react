import { auth, signOut } from "@constants/firebase";
import useGlobalStore from "@store/useStore";

export default function Dashboard() {
  const me = useGlobalStore((state) => state.me);
  const setIsLoggedIn = useGlobalStore((state) => state.setIsLoggedIn);

  // console.log(me);
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsLoggedIn(false);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <>
      <section>
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <div>
            <h1>Dashboard</h1>
            <img
              src={me?.photoURL || ""}
              alt="Profile"
              className="w-12 h-12 rounded-full"
            />
            <p>Welcome, {me?.displayName}</p>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
          <div className="aspect-video rounded-xl bg-muted/50" />
          <div className="aspect-video rounded-xl bg-muted/50" />
        </div>
      </section>
    </>
  );
}
