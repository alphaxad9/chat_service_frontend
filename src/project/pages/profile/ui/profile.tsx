import LargeProfile from "./large";
function Profile() {


  return (
    // 3. Apply the dynamic classes to the main div
    <div className={` min-w-screen min-h-screen`}>
       <LargeProfile />
    </div>
  );
}

export default Profile;