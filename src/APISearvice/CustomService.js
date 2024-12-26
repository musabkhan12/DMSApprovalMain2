import Swal from 'sweetalert2';
export const getEntity = async (_sp) => {
    let arr =[]
   await _sp.web.lists.getByTitle("ARGEntityMaster").items.select("ID,Entity").filter("Active eq 1")()
    .then((res) => {
        console.log(res);
        const newArray = res.map(({ ID, Entity }) => ({ id:ID, name:Entity }));
        console.log(newArray,'newArray');

        arr= newArray;
    })
    .catch((error) => {
        console.error("Error fetching data: ", error);
    });
    return arr;
}
export const getCategory = async (_sp,id) => {
    let arr =[]
   await _sp.web.lists.getByTitle("ARGAnnouncementsandNewsCategory").items.select("ID,Category,AnnouncementandNewsTypeMaster/TypeMaster,AnnouncementandNewsTypeMaster/ID").expand("AnnouncementandNewsTypeMaster").filter(`(Active eq 1) and(AnnouncementandNewsTypeMaster/ID eq ${id})`)()
    .then((res) => {
        console.log(res);
        const newArray = res.map(({ ID, Category }) => ({ id:ID, name:Category }));
        console.log(newArray,'newArray');

        arr= newArray;
    })
    .catch((error) => {
        console.error("Error fetching data: ", error);
    });
    return arr;
}
export const getType = async (_sp) => {
    let arr =[]
   await _sp.web.lists.getByTitle("AnnouncementandNewTypeMaster").items.select("ID,TypeMaster")()
    .then((res) => {
        console.log(res);
        const newArray = res.map(({ ID, TypeMaster }) => ({ id:ID, name:TypeMaster }));
        console.log(newArray,'newArray');

        arr= newArray;
    })
    .catch((error) => {
        console.error("Error fetching data: ", error);
    });
    return arr;
}
export const getCurrentUser = async (_sp) => {
    let arr =[]
   await _sp.web.currentUser()
    .then(async (res) => {
        console.log(res);
       
        arr= res;
         const  ProfilePic=  `https://officeindia.sharepoint.com/sites/AlRostmani/_layouts/15/userphoto.aspx?size=M&accountname=${res.Email}`
       //await getUserProfilePicture(res.Id,_sp)
    })
    .catch((error) => {
        console.error("Error fetching data: ", error);
    });
    return arr;
}
export const getCurrentUserProfile = async (_sp) => {
    const ProfilePic =[]
   await _sp.web.currentUser()
    .then(async (res) => {
        console.log(res);
       
     //   arr= res;
         ProfilePic=  `https://officeindia.sharepoint.com/sites/AlRostmani/_layouts/15/userphoto.aspx?size=M&accountname=${res.Email}`
       //await getUserProfilePicture(res.Id,_sp)
    })
    .catch((error) => {
        console.error("Error fetching data: ", error);
    });
    return ProfilePic;
}

export const getCurrentUserName = async (_sp) => {
    let arr =""
   await _sp.web.currentUser()
    .then((res) => {
        console.log(res);
    
        arr= res["Title"];
        
    })
    .catch((error) => {
        console.error("Error fetching data: ", error);
    });
    return arr;
}

export async function getUserProfilePicture(authorId,sp) {
    try {
      // Get user information by ID
      const user = await sp.web.getUserById(authorId)();
  
      if (user) {
        // The 'Picture' field holds the profile picture URL
        const profilePictureUrl = `${user.PictureUrl}`;
        console.log(profilePictureUrl,'profilePictureUrl');
        
        return profilePictureUrl;
      }
      return null;
    } catch (error) {
      console.error("Error fetching profile picture:", error);
      return null;
    }
  }

  export const getCurrentUserProfileEmail = async (sp) => {
    const Email =""
   await sp.web.currentUser()
    .then(async (res) => {
        console.log(res);
       
     //   arr= res;
         Email=  res.Email;
       //await getUserProfilePicture(res.Id,_sp)
    })
    .catch((error) => {
        console.error("Error fetching data: ", error);
    });
    return Email;
}
export const getCurrentUserProfileEmailForPeople = async (sp) => {
    const UserID =""
   await sp.web.currentUser()
    .then(async (res) => {
        console.log(res);
       
     //   arr= res;
        // Email=  res.Email;
         const UserID = await sp.web.ensureUser(res.Email);
       
       //await getUserProfilePicture(res.Id,_sp)
    })
    .catch((error) => {
        console.error("Error fetching data: ", error);
    });
    return user.data.Id; 
}