import React, { useEffect, useState, useRef} from "react";
import { SPFI } from "@pnp/sp/presets/all";
import { getSP } from '../loc/pnpjsConfig';
import "@pnp/sp/webs";
import "@pnp/sp/folders";
import "@pnp/sp/files";
import "@pnp/sp/sites"
import "@pnp/sp/presets/all"
import "@pnp/sp/webs";
import "@pnp/sp/sites";
import "@pnp/sp/site-users/web";
import "bootstrap/dist/css/bootstrap.min.css";
import Select from "react-select";
let FileUID:any = ''
 let remark :any = ''
 let itemIdOfDMSFolderDeligationMaster:number;
 let folderPath:any=''
const DMSFolderApproval = ({props}:any) => {
    const sp: SPFI = getSP();
    // console.log("Props",props)
    const [listData,setListData]=useState([]);
    const [IsPrivate,setIsPrivate]=useState(false);
    const [IsApproval,setIsApproval]=useState(false);
    const [IsLibrary,setIsLibray]=useState(false);
    const [folderName,setFolderName]=useState("");
    const [siteName, setSiteName]=useState("")
    const [folderPrivacy, setFolderPrivacy] = useState<string>("");
    const [approvalOption, setApprovalOption] = useState<string>("");
    const [formFields,setFormFields]=useState([]);
    const [rowsForPermission, setRowsForPermission] = React.useState<
    { id: number; selectedUserForPermission: string[]; selectedPermission:"" }[]
    >([{ id: 0, selectedUserForPermission: [],selectedPermission:"" }]);

    const [rows, setRows] = React.useState<
                 { id: number; selectionType: "All" | "One"; approvedUserList: string[] }[]
          >([{ id: 0, selectionType: "One", approvedUserList: [] }]);

    const [toggleLog,setToggleLog]=useState(false);
    const [remark,setRemark]=useState("");
    const  getUserTitle=async(userEmail:any)=>{
      try {
        // Ensure the user exists in the site collection and get their information
        const user = await sp.web.ensureUser(userEmail);
    
        // Retrieve the user's title
        const userTitle = user?.data?.Title;
    
        console.log(`User Title for ${userEmail}:`, userTitle);
        return userTitle;
      } catch (error) {
        console.error("Error fetching user title:", error);
        return null;
      }
    }
    const currentUserEmailRef = useRef('');
    useEffect(() => {
        getcurrentuseremail()
   }, []);

   const getcurrentuseremail = async()=>{
    const userdata = await sp.web.currentUser();
    currentUserEmailRef.current = userdata.Email;
   }
   useEffect(()=>{
        const fechDataFromDMSFolderDeligationMaster=async()=>{
            let requestNumber='DMS2024-12-28T05:16:59.110Z'
            const items = await sp.web.lists.getByTitle('DMSFolderDeligationMaster').items.select("*").filter(`RequestNo eq '${requestNumber}'`)();
            console.log("items",items);
            itemIdOfDMSFolderDeligationMaster=items[0].ID;
            folderPath=items[0].FolderPath;
            if(items[0].IsPrivate){
              let items1:any[]=[]
              if(items[0].IsLibrary === true){
                try {
                  items1 = await sp.web.lists.getByTitle('DMSFolderPrivacy').items.select("*").filter(`SiteName eq '${items[0].SiteTitle}' and DocumentLibraryName eq '${items[0].DocumentLibraryName}' and FolderName eq ${null}`)();
                  console.log("items1",items1);
                } catch (error) {
                  console.log("Error in getting data from DMSFolderPrivacy ",error);
                }             

              }else if(items[0].IsFolder === true){
                items1 = await sp.web.lists.getByTitle('DMSFolderPrivacy').items.select("*").filter(`SiteName eq '${items[0].SiteTitle}' and DocumentLibraryName eq '${items[0].DocumentLibraryName}' and FolderName eq '${items[0].FolderName}'`)();
              }                
            // Initialize array to store the default users  
            const arrayToStoreDefaultUser = items1.map((user) => ({
              itemId:user.Id,
              userId: user.UserID,
              value: user.User,
              label: user.User,
              Permission:user.UserPermission
          }));

          // filter the data.
          const filteredData = arrayToStoreDefaultUser.filter(item => item.userId !== null && item.value !== null && item.label !== null);

            // Helper function to generate a random ID
            const generateRandomId = (): number => Math.floor(Math.random() * 100000);
            const grouped: { [key: string]: any } = {};
            filteredData.forEach((user)=>{
                  const { Permission } = user;
                  // If the permission group doesn't exist, create it with a random id
                  if (!grouped[Permission]) {
                      grouped[Permission] = {
                      id: generateRandomId(),
                      selectedUserForPermission: [],
                      selectedPermission: {value:Permission,label:Permission}
                  };
                }

                // Add the user to the correct permission group
                grouped[Permission].selectedUserForPermission.push(user);
            })
            // console.log("grouped",grouped)
            const permissionsArray = Object.keys(grouped).map(key => grouped[key]);
            console.log("permissionsArray",permissionsArray);
            setRowsForPermission(permissionsArray)
             
            }
            // setListData(items);
            if(items[0].IsLibrary === true){
              setFolderName(items[0].DocumentLibraryName);

              try {
                const existingColumns = await sp.web.lists.getByTitle("DMSPreviewFormMaster").items.select("ColumnName", "ColumnType","ID","IsRename").filter(`SiteName eq '${items[0].SiteTitle}' and DocumentLibraryName eq '${items[0].DocumentLibraryName}' and IsDocumentLibrary eq 0  and IsInProgress eq 0`)();
                console.log("existingColumns",existingColumns);
                setFormFields(existingColumns);
              } catch (error) {
                console.log("Error in getting the data from DMSPreviewFormMaster",error);
              }

              const LibraryApproverDdetails = await sp.web.lists
            .getByTitle("DMSFolderPermissionMaster")
            .items.select("CurrentUser" , "SiteName" , "DocumentLibraryName" , "Permissions","ApprovalType","Level","ApprovalUser/Title","ApprovalUser/Id","ID").expand("ApprovalUser")
            .filter(`SiteName eq '${items[0].SiteTitle}' and DocumentLibraryName eq '${items[0].DocumentLibraryName} '`)();

            const groupedByLevel: { [key: number]: { id: number; selectionType:"All" | "One"; approvedUserList: any[] } } = {};

            LibraryApproverDdetails.forEach(async(item)=>{
              const level = item.Level; 
              let approvalType: "All" | "One" = item.ApprovalType ? "All" : "One";

              // Check if the level already exists in the groupedByLevel object
              if (!groupedByLevel[level]) {
                // If not, initialize an object for this level
                
                groupedByLevel[level] = {
                  id: level-1,                
                  selectionType:approvalType,        
                  approvedUserList: []
                };
              }

              const approvalUserDetails={
                email:item.CurrentUser,
                label:item.ApprovalUser.Title,
                value:item.ApprovalUser.Title, 
                userId:item.ApprovalUser.Id
              }
              groupedByLevel[level].approvedUserList.push(approvalUserDetails);
            })

            // const levelArray = Object.values(groupedByLevel);
            const levelArray = Object.keys(groupedByLevel).map(key => groupedByLevel[parseInt(key)]);

            console.log("levelArray",levelArray);
            console.log("groupedByLevel",groupedByLevel);
            console.log("Library Details",LibraryApproverDdetails);
            setRows(levelArray);

              
              setApprovalOption(items[0].IsApproval ? "Yes" : "No")
              setIsApproval(items[0].IsApproval)
            }else if(items[0].IsFolder === true){
              setFolderName(items[0].FolderName);
            }

            setFolderPrivacy(items[0].IsPrivate ? "private" : "public");
            setIsPrivate(items[0].IsPrivate)
            setIsLibray(items[0].IsLibrary)
            setSiteName(items[0].SiteTitle)
        }
        fechDataFromDMSFolderDeligationMaster();
    },[])
    useEffect(()=>{
      const fetchDataFromDMSFolderDeligationApprovalTask=async()=>{
        try {
        //   const listData=await sp.web.lists.getByTitle('DMSFolderDeligationApprovalTask').items.select("Approver","Folderdetail/CurrentUser","Folderdetail/Created","Folderdetail/Status").filter(`Folderdetail/RequestNo eq '${props}'`).expand("Folderdetail")();
          // setListData(listData);
          let requestNumber='DMS2024-12-28T05:16:59.110Z'
          const listData=await sp.web.lists.getByTitle('DMSFolderDeligationApprovalTask').items.select(
            "*",
            "Folderdetail"	            
            ,"Folderdetail/SiteTitle"	       
            ,"Folderdetail/DocumentLibraryName"	
            ,"Folderdetail/CurrentUser"
            ,"Folderdetail/FolderPath"
            ,"Folderdetail/FolderName"
            ,"Folderdetail/ParentFolderId"
            ,"Folderdetail/Department"	
            ,"Folderdetail/Devision"	
            ,"Folderdetail/RequestNo"	
            ,"Folderdetail/Status"	
            ,"Folderdetail/Created"	
            ,"Remark"	
            ,"Log"	
            ,"LogHistory"	
            ,"FolderMeta"	
            ,"FolderMeta/SiteName"	
            ,"FolderMeta/DocumentLibraryName"	
            ,"FolderMeta/ColumnName",
            // "Folderdetail/ProcessName",
            "Approver"
        )
        .expand("Folderdetail" ,"FolderMeta")
        .filter(`Folderdetail/RequestNo eq '${requestNumber}'`)
        .orderBy("Modified", false)();
          console.log("listData",listData)
          listData.forEach((item)=>{
            console.log("item to check and show approve" , item)
            if(currentUserEmailRef.current === item.Approver && item.Log === null){
                setToggleLog(true);
            }
             console.log("FileUID" , item.Folderdetail.RequestNo)
             FileUID = item.Folderdetail.RequestNo
            
        })
          const filterData=await Promise.all(
            listData.map(async (item) => {
              const approverTitle = await getUserTitle(item.Approver);
              const currentUserTitle = await getUserTitle(item.Folderdetail.CurrentUser);
              return {
                itemId:item.ID,
                Log:item.Log,
                LogHistory:item.LogHistory,
                ApproverEmail:item.Approver,
                Approver: approverTitle,
                CurrentUser: currentUserTitle,
                Created: item.Folderdetail.Created,
                Status: item.Folderdetail.Status,
              };
            })
          );
          setListData(filterData);
        } catch (error) {
          console.log("Error in fetching the data from DMSFolderDeligationApprovalTask",error);
        }
      }
      fetchDataFromDMSFolderDeligationApprovalTask();
    },[])
    
    const handleRemark=(event:any)=>{
        event.preventDefault();
        event.stopPropagation();
        setRemark(event.target.value);
        // remark = event.target.value 
        console.log(remark, "remaksss")
      }

      
    const handleLogAndLogHistory=async(event:any)=>{
        event.preventDefault(); 
        const buttonText = event.target.innerText || event.target.textContent;
        console.log("list data",listData);
        console.log("buttonText",buttonText);

        if(buttonText === "Approve"){
            // listData.forEach(async(task)=>{
            //     if(task.ApproverEmail === currentUserEmailRef.current){
            //         if(task.Log === null){
            //             try {
            //                 // Update the item
            //                 await sp.web.lists.getByTitle('DMSFolderDeligationApprovalTask').items.getById(task.itemId).update({
            //                   Log: 'Approved',
            //                   Remark:remark 
            //                 });
            //                 console.log(`Item ${task.itemId} in list DMSFolderDeligationApprovalTask updated successfully.`);
            //               } catch (error) {
            //                 console.error("Error updating list item:", error);
            //               }
                      
            //         }
            //     }
            // })
            await Promise.all(
                listData.map(async (task) => {
                  if (task.ApproverEmail === currentUserEmailRef.current && task.Log === null) {
                    try {
                      await sp.web.lists
                        .getByTitle("DMSFolderDeligationApprovalTask")
                        .items.getById(task.itemId)
                        .update({
                          Log: "Approved",
                          Remark: remark,
                          LogHistory:new Date().toISOString()
                        });
                      console.log(`Item ${task.itemId} updated successfully.`);
                    } catch (error) {
                      console.error(`Error updating item ${task.itemId}:`, error);
                    }
                  }
                })
              );
            let requestNumber='DMS2024-12-28T05:16:59.110Z'
            const listData1=await sp.web.lists.getByTitle('DMSFolderDeligationApprovalTask').items.select(
              "*",
              "Folderdetail"	            
              ,"Folderdetail/SiteTitle"	       
              ,"Folderdetail/DocumentLibraryName"	
              ,"Folderdetail/CurrentUser"
              ,"Folderdetail/FolderPath"
              ,"Folderdetail/FolderName"
              ,"Folderdetail/ParentFolderId"
              ,"Folderdetail/Department"	
              ,"Folderdetail/Devision"	
              ,"Folderdetail/RequestNo"	
              ,"Folderdetail/Status"	
              ,"Folderdetail/Created"	
              ,"Remark"	
              ,"Log"	
              ,"LogHistory"	
              ,"FolderMeta"	
              ,"FolderMeta/SiteName"	
              ,"FolderMeta/DocumentLibraryName"	
              ,"FolderMeta/ColumnName",
              // "Folderdetail/ProcessName",
              "Approver"
          )
          .expand("Folderdetail" ,"FolderMeta")
          .filter(`Folderdetail/RequestNo eq '${requestNumber}'`)
          .orderBy("Modified", false)();
            // Check if all `Log` values are "Approved"
            const allApproved = listData1.every(item => item.Log === "Approved");
            if (allApproved) {
                try {
                  // Update the list item
                    //   let requestNumber='DMS2024-12-28T05:16:59.110Z'
                    //   const data=await sp.web.lists.getByTitle('DMSFolderDeligationMaster').items.select('*',"ID").filter(`RequestNo eq '${requestNumber}'`)()
                  
                   // Update the list item
                    await sp.web.lists.getByTitle('DMSFolderDeligationMaster').items.getById(itemIdOfDMSFolderDeligationMaster).update({
                        Status: "Approved",
                    });
                    console.log(`List item ${itemIdOfDMSFolderDeligationMaster} updated successfully.`);
                    const folderMasterData=await sp.web.lists.getByTitle('DMSFolderMaster').items.select("*","ID").filter(`FolderPath eq '${folderPath}'`)();
                    await sp.web.lists.getByTitle('DMSFolderMaster').items.getById(folderMasterData[0].ID).update({
                        IsFolderDeligation: false,
                    });

                } catch (error) {
                  console.error("Error updating list item:", error);
                }
            } else {
                console.log("Not all Log values are Approved.");
              }
        }else if(buttonText === "Reject"){
            await Promise.all(
            listData.map(async(task)=>{
                if(task.ApproverEmail === currentUserEmailRef.current){
                    if(task.Log === null){
                        try {
                            // Update the item
                            await sp.web.lists.getByTitle('DMSFolderDeligationApprovalTask').items.getById(task.itemId).update({
                              Log: 'Reject',
                              Remark:remark,
                              LogHistory:new Date().toISOString()
                            });
                            console.log(`Item ${task.itemId} in list DMSFolderDeligationApprovalTask updated successfully.`);
                          } catch (error) {
                            console.error("Error updating list item:", error);
                          }
                      
                    }
                }else{
                    if(task.Log === null){
                        try {
                            // Update the item
                            await sp.web.lists.getByTitle('DMSFolderDeligationApprovalTask').items.getById(task.itemId).update({
                              Log: 'Auto Reject',
                              LogHistory:new Date().toISOString() 
                            });
                            console.log(`Item ${task.itemId} in list DMSFolderDeligationApprovalTask updated successfully.`);
                          } catch (error) {
                            console.error("Error updating list item:", error);
                          }
                    }
                }
            }))

            try {
                await sp.web.lists
                  .getByTitle("DMSFolderDeligationMaster")
                  .items.getById(itemIdOfDMSFolderDeligationMaster)
                  .update({
                    Status: "Reject",
                  });
                console.log(
                  `Master list item ${itemIdOfDMSFolderDeligationMaster} updated to 'Reject' successfully.`
                );
              } catch (error) {
                console.error(
                  `Error updating master list item ${itemIdOfDMSFolderDeligationMaster}:`,
                  error
                );
              }
        }
    }
  return (
    <>
      <div className="container mt-3">
        <div className="card cardborder p-3" style={{
          
        }}>
          <form>
          <div className="row mt-3">
          <div className="DMSMasterContainer">
                                {/* <h4 className="page-title fw-bold mb-1 font-20">Settings</h4> */}
                                <div className="" style={{ backgroundColor: 'white', border:'1px solid #54ade0', marginTop:'20px', borderRadius:'20px', padding: '15px'}}>
                                    <table className="mtbalenew">
                                      <thead >
                                        <tr>
                                          <th
                                            style={{
                                            minWidth: '40px',
                                            maxWidth: '40px',
                                           
                                            }}
                                          >
                                               S.No
                                          </th>
                                          <th>Level</th>
                                          {/* <th style={{ minWidth: '120px', maxWidth: '120px' }}>Process Name</th> */}
                                          <th >Assigned To</th>
                                   
                                          <th>Requester Name</th>
                                          <th style={{ minWidth: '150px', maxWidth: '150px' }}>Requested Date</th>
                                          {/* <th style={{ minWidth: '150px', maxWidth: '150px' }}>Action Taken By</th>
                                          <th style={{ minWidth: '150px', maxWidth: '150px' }}>Action Taken On</th>
                                          <th
                                            style={{
                                            minWidth: '70px',
                                            maxWidth: '70px',
                                           
                                            }}
                                            >
                                              Remark
                                            </th> */}
                                          <th style={{ minWidth: '80px', maxWidth: '80px' }}>Status</th>
                                         
                                          </tr>
                                        </thead>
                                        <tbody style={{ maxHeight: '8007px' }}>
         
                                              {listData.length > 0  ? listData.map((item, index) => {
                                              return(
                                                    <tr>
                                                      <td style={{ minWidth: '40px', maxWidth: '40px' }}>
                                                        <span style={{marginLeft:'0px'}} className="indexdesign">
                                                        {index}</span></td>
                                                      {/* <td>{(truncateText(item.FileUID.FileUID, 20))}
                                                      </td> */}
                                                      <td >Level 1
                                                        {/* {
                                                        item.MasterApproval.Level
                                                        } */}
                                                        </td>
                                                        <td>
                                                          
                                                       
                                                             {item?.Approver}
                                                            
                                                             {/* {getUserTitleByEmail(item?.CurrentUser)} */}
  
                                                         </td>
                                                      <td >
                                                        {/* {(truncateText(item.FileUID.RequestedBy, 25))} */}
                                                         {item?.CurrentUser}
                                                        </td> 
                                                      <td style={{ minWidth: '150px', maxWidth: '150px' }}>
                                                          <div
                                                            style={{
                                                              padding: '5px',
                                                              border: '1px solid #efefef',
                                                              background: '#fff',
                                                              borderRadius: '30px',fontSize:'14px',
                                                            
                                                            }}
                                                            className="btn btn-light"
                                                          >
                                                            {/* {new Date(item?.FileUID?.Created).toLocaleDateString()} */}
                                                            {new Date(item?.Created).toLocaleString('en-US', { 
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true 
})}

                                                          </div>
                                                      </td>
                                                      <td style={{ minWidth: '150px', maxWidth: '150px' }}>
                                                          <div
                                                            style={{
                                                              padding: '5px',
                                                              border: '1px solid #efefef',
                                                              background: '#fff',
                                                              borderRadius: '30px',fontSize:'14px',
                                                            
                                                            }}
                                                            className="btn btn-light"
                                                          >
                                                            {item?.Status}

                                                          </div>
                                                      </td>
                                                      {/* <td style={{ minWidth: '150px', maxWidth: '150px' }}>
                                                          <div
                                                            style={{
                                                              padding: '5px',
                                                              border: '1px solid #efefef',
                                                              background: '#fff',
                                                              borderRadius: '30px',fontSize:'14px',
                                                            
                                                            }}
                                                            className="btn btn-light"
                                                          >
                                                        
                                                            {new Date(item?.Modified).toLocaleString('en-US', { 
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true 
})}
                                                          </div>
                                                      </td> */}
                                                      {/* <td style={{ minWidth: '70px', maxWidth: '70px' }}>
                                                        {item.Remark}
                                                      </td> */}
                                                      {/* <td style={{ minWidth: '80px', maxWidth: '80px', textAlign:'center' }}>
                                                        
                                                          <div className="finish mb-0">  {item.FileUID.Status} </div>
                                                      </td> */}
                                                      {/* <td style={{ minWidth: '70px', maxWidth: '70px' }}>
                                                            <a onClick={(e )=>getTaskItemsbyID(e , item.FileUID.FileUID)}>
                                                                <FontAwesomeIcon icon={faEye} />
                                                            </a>
                                                      </td> */}
                                                      
                                                      </tr>
                                                        )
                                                              })
                                                            :""
                                                        }       
                                      </tbody>
                                </table>
                            </div>
                        </div>
          </div>
            <div className="row mt-3">
              <div className="col-12 col-md-6">
              <div className="form-group">
                  <label htmlFor="folderName" className="headerfont">
                    Site Name
                  </label>
                  <input
                    type="text"
                    className="form-control fieldmargin"
                    id="folderName"
                    // placeholder="Enter project name"
                    value={siteName}
                    disabled
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="folderName" className="headerfont">
                    Folder Name
                  </label>
                  <input
                    type="text"
                    className="form-control fieldmargin"
                    id="folderName"
                    // placeholder="Enter project name"
                    value={folderName}
                    disabled
                  />
                </div>
              </div>
                  <div className="col-12 col-md-6" id="folderPrivacy" style={{
                      width:"25%"
                  }}>
                        <div className="form-group">
                          <label htmlFor="folderPrivacy" className="headerfont">
                            Folder Privacy
                          </label>
                        <div>
                        <div className="form-check form-check-inline fieldmargin">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="folderPrivacy"
                            id="private"
                            value="private"
                            checked={folderPrivacy === "private"}
                            disabled
                          />
                          <label className="form-check-label" htmlFor="private">
                            Private
                          </label>
                        </div>
                        <div className="form-check form-check-inline">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="folderPrivacy"
                            id="public"
                            value="public"
                            checked={folderPrivacy === "public"}
                            disabled
                          />
                          <label className="form-check-label" htmlFor="public">
                            Public
                          </label>
                        </div>
                      </div>
                        </div>
                  </div>

              {IsLibrary &&  (
              <div className="col-12 col-md-6" id="approvalOption" style={{
                   width:"25%"
              }}>
                <div className="form-group">
                          <label htmlFor="approvalOption" className="headerfont">
                            Approval
                          </label>
                        <div>
                        <div className="form-check form-check-inline fieldmargin">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="approvalOption"
                            id="Yes"
                            value="Yes"
                            checked={approvalOption === "Yes"}
                            disabled
                          />
                          <label className="form-check-label" htmlFor="Yes">
                            Yes
                          </label>
                        </div>
                        <div className="form-check form-check-inline">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="approvalOption"
                            id="No"
                            value="No"
                            checked={approvalOption === "No"}
                            disabled
                          />
                          <label className="form-check-label" htmlFor="No">
                              No
                          </label>
                        </div>
                      </div>
                </div>
              </div>
             )}
            </div>
        
          </form>
        </div>
    

       
      </div>
      {IsLibrary && formFields.map((formField) => (
      <div className="row mt-3" key={formField.id} id="columnDetail">
        <div className="col-12 col-md-6">
          <div className="form-group">
            <label htmlFor={`fieldName-${formField.id}`} className="headerfont">
              Field Name
            </label>
            <input
              type="text"
              className="form-control fieldmargin"
              id={`fieldName-${formField.id}`}
              name="fieldName"
              // placeholder="Enter field name"
              value={formField.ColumnName}
              disabled
            />

          </div>
        </div>

        <div className="col-12 col-md-5">
          <div className="form-group">
            <label htmlFor={`selectField-${formField.id}`} className="headerfont">
              Select Field Type
            </label>
            <select
              className="form-control"
              id={`selectField-${formField.id}`}
              name="selectField"
              value={formField.ColumnType}
              disabled
            >
              <option value="">Open this select menu</option>
              <option value="Single Line of Text">Single Line of Text</option>
              <option value="Multiple Line of Text">Multiple Line of Text</option>
              <option value="Yes or No">Yes or No</option>
              <option value="Date & Time">Date & Time</option>
              <option value="Number">Number</option>
            </select>
          </div>
        </div>
      </div>
      
      ))}
      {IsLibrary && IsApproval &&  (
        <div className="card cardborder marginleftcard" style={{ height: "auto", width: "100%" }}>
        <h5 className="mb-3 Permissionsectionstyle">
          <strong>Approval Hierarchy</strong>
        </h5>
        <p className="subheadernew">
          Define approval hierarchy for the documents submitted by Team
          members in this folder.
        </p>
        <div className="mb-3">
        </div>
        <div className="row mb-3 approvalheirarcystyle">
          <div className="col-12 col-md-4">
            <label htmlFor="level" className="form-label approvalhierarcyfont">
              Level
            </label>
          </div>
          <div className="col-12 col-md-6">
            <label htmlFor="approver" className="form-label approvalhierarcyfont">
              Approver
            </label>
          </div>
        </div>
        {rows.map((row) => (
          <div className="row mb-3 approvalheirarchyfield" key={row.id}>
            <div className="col-12 col-md-4">
              <input type="text" className="form-control" id={`level-${row.id}`} value={`Level ${row.id + 1}`} disabled />
            </div>
            <div className="col-12 col-md-6">
              <Select
                value={row.approvedUserList}
                isMulti
                // placeholder="Enter names or email addresses..."
                noOptionsMessage={() => "No User Found..."}
                isDisabled={true}
              />
            </div>
            <div className="col-12 col-md-2 d-flex">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name={`selection-${row.id}`}
                  id={`all-${row.id}`}
                  value="all"
                  checked={row.selectionType === "All"}
                  disabled
                />
                <label className="form-check-label" htmlFor={`all-${row.id}`}>
                  All
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name={`selection-${row.id}`}
                  id={`one-${row.id}`}
                  value="one"
                  checked={row.selectionType === "One"}
                  disabled
                />
                <label className="form-check-label" htmlFor={`one-${row.id}`}>
                  One
                </label>
              </div>
            </div>
          </div>
        ))}
      </div> 
      )
      }
      
    {IsPrivate &&   <div className="container mt-3">
                <div className="card cardborder marginleftcard" style={{
               
                  }}>
                      <h5 className="mb-3 Permissionsectionstyle">
                          <strong>Permission</strong>
                      </h5>
                      <div className="row">
                        <div className="col-md-6"></div>
                        <div className="col-md-5"></div>
                        <div className="col-md-1">
                        <div style={{position:'relative'}} className="mb-3">
                      </div>
                        </div>

                      </div>
                      
                      {rowsForPermission.map((rowForPermission)=>(
                          <div className="row mb-3 approvalheirarcystyle" key={rowForPermission.id}>
                              <div className="col-12 col-md-6">
                                  <Select
                                      isMulti
                                      value={rowForPermission.selectedUserForPermission}
                                      // placeholder="Enter names or email addresses..."
                                      noOptionsMessage={() => "No User Found..."}
                                      isDisabled={true}
                                  />
                              </div>
                              <div className="col-12 col-md-5" 
                              
                              >
                                  <Select
                                      value={rowForPermission.selectedPermission || null}
                                      // placeholder="Select Permission"
                                      noOptionsMessage={() => "No Such Permission Find"}
                                      isDisabled={true}
                                  />
                              </div>
                          </div>
                      ))}

                </div>

                <div>
           
                </div>
    </div> 
    }


{toggleLog && (
    // <div className="card cardborder marginleftcard" style={{ height: "auto", width: "100%" }}>
                                  <div className="" style={{ backgroundColor: 'white', border:'1px solid #54ade0', marginTop:'20px', borderRadius:'20px', padding: '15px'}}>
   {/* <iframe id="filePreview" width="100%" height="400"></iframe> */}
                           <div className="">
                            <div className="">
                            
                              <div className="row">
                           
                                <div className="col-lg-12">
                                  <div className="mb-0">
                                    <label className="form-label text-dark font-14">
                                      Remarks:
                                    </label>
                                    <input
                                     type="text" style={{height:'70px'}}  className="form-control"
                                     onChange={handleRemark}
                                     value={remark}
                                      />
                                  </div>
                                </div>
                              </div>
  
                              <div className="row mt-3">
                                <div className="col-12 text-center">
                                  <a >
                                    {" "}
                                    <button
                                      
                                      onClick={handleLogAndLogHistory}
                                      type="button"
                                      className="btn btn-success waves-effect waves-light m-1"
                                    >
                                      <i className="fe-check-circle me-1"></i>{" "}
                                      Approve
                                    </button>
                                  </a>
                                  {/* <a >
                                    {" "}
                                    <button
                                      
                                    //   onClick={handleLogAndLogHistory}
                                      type="button"
                                      className="btn btn-orange waves-effect waves-light m-1"
                                    >
                                      <i className="fe-check-circle me-1"></i>{" "}
                                      Rework
                                    </button>
                                  </a> */}
                                  {/* <a >  <button type="button" className="btn btn-warning waves-effect waves-light m-1"><i className="fe-corner-up-left me-1"></i> Rework</button></a>   */}
                                  <a >
                                    {" "}
                                    <button
                                      onClick={handleLogAndLogHistory}
                                      type="button"
                                      className="btn btn-danger waves-effect waves-light m-1"
                                    >
                                      <i className="fe-x-circle me-1"></i>{" "}
                                      Reject
                                    </button>
                                  </a>
                                  <button
                                    type="button"
                                    className="btn btn-light waves-effect waves-light m-1"
                                  >
                                    <i className="fe-x me-1"></i> Cancel
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                      </div>
                    //   </div>
                    )}

    </>
  )
}

export default DMSFolderApproval