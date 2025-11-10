import Swal from "sweetalert2";

// get user and posts
export async function getUserProfile (setLoading,setUser,username){
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:3000/api/users/${username}`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };


//delete posts
