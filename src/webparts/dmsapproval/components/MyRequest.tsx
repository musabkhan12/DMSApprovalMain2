
 

import { escape, set } from "@microsoft/sp-lodash-subset";

import React, { useEffect, useState } from "react";

import VerticalSideBar from "../../verticalSideBar/components/VerticalSideBar";

import HorizontalNavbar from "../../horizontalNavBar/components/HorizontalNavBar";
import { Button, Modal } from 'react-bootstrap';

// ...


import "bootstrap/dist/css/bootstrap.min.css";

import "../../../CustomCss/mainCustom.scss";

// import "../components/MyApproval.scss";

import "bootstrap/dist/js/bootstrap.bundle.min.js";

import "./CustomTable.scss";

import "../../verticalSideBar/components/VerticalSidebar.scss";

import Provider from "../../../GlobalContext/provider";

import UserContext from "../../../GlobalContext/context";

// import CustomBreadcrumb from "../../../CustomJSComponents/CustomBreadcrumb/CustomBreadcrumb";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
let currentItemID= ''
import {

  faEdit,

  faPaperclip,

  faSort,

  faEye,

  faTrashAlt,
  faSearch,

} from "@fortawesome/free-solid-svg-icons";

import "../../../Assets/Figtree/Figtree-VariableFont_wght.ttf";

import * as XLSX from "xlsx";

import moment from "moment";



// import {

//   addItem,

//   GetCategory,

//   getChoiceFieldOption,

//   getDiscussionComments,

//   getDiscussionFilter,

//   getDiscussionFilterAll,

//   getDiscussionForum,

//   getDiscussionMe,

//   getDiscussionMeAll,

//   updateItem,

// } from "../../../APISearvice/DiscussionForumService";

import { encryptId } from "../../../APISearvice/CryptoService";



import Swal from "sweetalert2";

import { getCategory, getEntity } from "../../../APISearvice/CustomService";

import ReactQuill from "react-quill";

import { uploadFileToLibrary } from "../../../APISearvice/MediaService";

import "react-quill/dist/quill.snow.css";

import { SPFI } from "@pnp/sp/presets/all";

// import { fetchUserInformationList } from "../../../APISearvice/GroupTeamService";

// import Multiselect from "multiselect-react-dropdown";

import { Eye } from "react-feather";

import { getDataByID, getMyRequest, getRequestListsData, gteDMSApproval } from "../../../APISearvice/ApprovalService";

import { getSP } from '../loc/pnpjsConfig';

import { IMyRequestProps } from "./IMyRequestProps";

import { getAnncouncementByID } from "../../../APISearvice/AnnouncementsService";
import DMSMyApprovalAction from "./ApprovalAction";
import DMSMyrequestLog from "./DMSMyrequestLog";

const MyRequestContext = ({ props }: any) => {

  const sp: SPFI = getSP();

  const { useHide }: any = React.useContext(UserContext);

  const [announcementData, setAnnouncementData] = React.useState([]);

  const [myApprovalsData, setMyApprovalsData] = React.useState([]);

  const elementRef = React.useRef<HTMLDivElement>(null);

  const SiteUrl = props.siteUrl;

  const [newsData, setNewsData] = React.useState([]);

  const [TypeData, setTypeData] = React.useState([]);

  const [BnnerImagepostArr, setBannerImagepostArr] = React.useState([]);

  const [DocumentpostArr, setDocumentpostArr] = React.useState([]);

  const [DocumentpostArr1, setDocumentpostArr1] = React.useState([]);

  const [ImagepostArr, setImagepostArr] = React.useState([]);

  const [ImagepostArr1, setImagepostArr1] = React.useState([]);

  const [GrouTypeData, setGroupTypeData] = React.useState([]);

  const [DocumentpostIdsArr, setDocumentpostIdsArr] = React.useState([]);

  const [selectedValue, setSelectedValue] = useState([]);

  const [EnityData, setEnityData] = React.useState([]);

  const [options, setOpions] = useState([]);

  const [approved, setApproved] = useState('yes');

  const [MainCardBody, setMainCardBody] = useState('');

  const [filters, setFilters] = React.useState({

    SNo: "",

    RequestID: "",

    Title: "",

    ProcessName: "",

    RequestedBy: "",

    RequestedDate: "",

    Status: "",

  });

 

  const [isOpen, setIsOpen] = React.useState(false);

  const [IsinvideHide, setIsinvideHide] = React.useState(false);

  const toggleDropdown = () => {

    setIsOpen(!isOpen);

  };

 

  const [sortConfig, setSortConfig] = React.useState({

    key: "",

    direction: "ascending",

  });

 

 

 

  const [formData, setFormData] = React.useState({

    topic: "",

    category: "",

    entity: "",

    Type: "",

    GroupType: "",

    description: "",

    overview: "",

    FeaturedAnnouncement: false,

  });

  const [approveData, setApproveData] = useState([]);

  const [myRequestDataAll, setmyRequestDataAll] = useState([]);

const [myRequestDataAllDMS, setMyRequestDataAllDMS] = useState<any[]>([]);

  const [AutomationData, setAutomationData] = useState([]);

  const [isActivedata, setisActivedata] = useState(false)

  const [DiscussionData, setDiscussion] = useState([]);

  const [CategoryData, setCategoryData] = React.useState([]);

  const [showModal, setShowModal] = React.useState(false);

  const [showDocTable, setShowDocTable] = React.useState(false);

  const [showImgModal, setShowImgTable] = React.useState(false);

  const [showBannerModal, setShowBannerTable] = React.useState(false);

  const [currentUser, setCurrentUser] = React.useState(null);

  const [editForm, setEditForm] = React.useState(false);

  const [richTextValues, setRichTextValues] = React.useState<{

    [key: string]: string;

  }>({});

  const [activeTab, setActiveTab] = useState("Intranet");

  const handleTabClick = async (tab: React.SetStateAction<string>) => {
    setShowNestedDMSTable(""); 
    setActiveTab(tab);
    
    console.log("tab",tab)
    // alert(activeTab);
    if (tab == "Intranet") {

      setMyApprovalsData(myRequestDataAll);
      console.log(myApprovalsData , "myApprovalsData");
    } else if (tab == "DMS") {
      
      setMyApprovalsData(myRequestDataAllDMS);
   
      console.log(myRequestDataAllDMS , "myRequestDataAllDMS");
    } else if (tab == "Automation") {

      setMyApprovalsData(AutomationData);

    }

  };

 

  React.useEffect(() => {

    sessionStorage.removeItem("announcementId");

    ApiCall();

  }, [useHide]);

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const myrequestdatadms:any = await gteDMSApproval(sp);
  //       console.log("myrequestdatadms", myrequestdatadms);
  //       setMyRequestDataAllDMS(myrequestdatadms);
  //     } catch (error) {
  //       console.error('Error fetching data:', error);
  //     }
  //   };

  //   fetchData();
  // }, []);


  const ApiCall = async () => {

    let myrequestdata = await getMyRequest(sp);

    console.log(myrequestdata , "myrequestdata");
    let myrequestdatadms :any = await gteDMSApproval(sp);
 
    console.log(myrequestdatadms , "myrequestdatadms");
    setMyApprovalsData(await getMyRequest(sp));

    setmyRequestDataAll(myrequestdata);
    setMyRequestDataAllDMS(myrequestdatadms);

    let Automationdata = await getRequestListsData(sp);

    setAutomationData(Automationdata);

    console.log("AutomationdataAutomationdata", Automationdata, myrequestdata);

  };

  // const FilterDiscussionData = async (optionFilter: string) => {

  //   setAnnouncementData(await getDiscussionFilterAll(sp, optionFilter));

  // };

  const handleFilterChange = (

    e: React.ChangeEvent<HTMLInputElement>,

    field: string

  ) => {

    console.log("eee", e);

    setFilters({

      ...filters,

      [field]: e.target.value,

    });

  };

 

  const applyFiltersAndSorting = (data: any[]) => {

    // Filter data

    console.log(

      "filters",

      data,

      filters,

      filters.ProcessName,

      filters.RequestID

    );

    const filteredData = data?.filter((item, index) => {

 

      return (

        (filters.SNo === "" || String(index + 1).includes(filters.SNo)) &&

        (filters.ProcessName === "" ||

          (item.ProcessName != undefined &&

            item.ProcessName.toLowerCase().includes(

              filters.ProcessName.toLowerCase()

            ))) &&

        (filters.RequestID === "" ||

          (item.RequestID != undefined &&

            item.RequestID.toLowerCase().includes(

              filters.RequestID.toLowerCase()

            ))) &&

        // (filters.ProcessName === "" ||

        //   item.ProcessName.toLowerCase().includes(filters.ProcessName.toLowerCase())) &&

        (filters.Status === "" ||

          item.Status.toLowerCase().includes(filters.Status.toLowerCase())) &&
          (filters.RequestedDate === "" ||

            new Date(item.Created).toLocaleDateString()
              .startsWith(filters.RequestedDate + "")) &&
          (filters.RequestedBy === "" ||
           (activeTab == "Automation" ? (item?.Author?.Title?.toLowerCase().includes(
              filters.RequestedBy.toLowerCase()
            )): (item?.Requester?.Title?.toLowerCase().includes(
              filters.RequestedBy.toLowerCase()
            ))))

      );

    });

 

    const sortedData = filteredData?.sort((a, b) => {

      if (sortConfig.key === "SNo") {

        // Sort by index

        const aIndex = data.indexOf(a);

        const bIndex = data.indexOf(b);

        return sortConfig.direction === "ascending"

          ? aIndex - bIndex

          : bIndex - aIndex;

      }  else if (sortConfig.key == "RequestedDate") {

        // Sort by other keys

        const aValue = a['Created'] ? new Date(a['Created']) : "";

        const bValue = b['Created'] ? new Date(b['Created']) : "";

        if (aValue < bValue) {

          return sortConfig.direction === "ascending" ? -1 : 1;

        }

        if (aValue > bValue) {

          return sortConfig.direction === "ascending" ? 1 : -1;

        }

      }
       else if (sortConfig.key) {

 

        const aValue = a[sortConfig.key] ? a[sortConfig.key].toLowerCase() : "";

        const bValue = b[sortConfig.key] ? b[sortConfig.key].toLowerCase() : "";

        if (aValue < bValue) {

          return sortConfig.direction === "ascending" ? -1 : 1;

        }

        if (aValue > bValue) {

          return sortConfig.direction === "ascending" ? 1 : -1;

        }

      }

      return 0;

    });

    return sortedData;

  };

 

  const filteredMyApprovalData = applyFiltersAndSorting(myApprovalsData);

  const filteredNewsData = applyFiltersAndSorting(newsData);

  const [currentPage, setCurrentPage] = React.useState(1);

  const itemsPerPage = 10;

  const totalPages = Math.ceil(filteredMyApprovalData?.length / itemsPerPage);

 

  const [ContentData, setContentData] = React.useState<any>([]);

  const [currentItem, setCurrentItem] = React.useState<any>([]);

 

 

 

  const handlePageChange = (pageNumber: any) => {

    if (pageNumber > 0 && pageNumber <= totalPages) {

      setCurrentPage(pageNumber);

    }

  };

  const startIndex = (currentPage - 1) * itemsPerPage;

  const endIndex = startIndex + itemsPerPage;

  const currentData = filteredMyApprovalData?.slice(startIndex, endIndex);

  const newsCurrentData = filteredNewsData?.slice(startIndex, endIndex);

  const [editID, setEditID] = React.useState(null);

  const [ImagepostIdsArr, setImagepostIdsArr] = React.useState([]);

  const siteUrl = props.siteUrl;

 

  const Breadcrumb = [

    {

      MainComponent: "Home",

      MainComponentURl: `${siteUrl}/SitePages/Dashboard.aspx`,

    },

    {

      ChildComponent: "My Request",

      ChildComponentURl: `${siteUrl}/SitePages/MyRequests.aspx`,

    },

  ];

  console.log(announcementData, "announcementData");

 

  const exportToExcel = (data: any[], fileName: string) => {

    const workbook = XLSX.utils.book_new();

    const worksheet = XLSX.utils.json_to_sheet(data);

    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    XLSX.writeFile(workbook, `${fileName}.xlsx`);

  };

 

  const handleSortChange = (key: string) => {

    let direction = "ascending";

    if (sortConfig.key === key && sortConfig.direction === "ascending") {

      direction = "descending";

    }

    setSortConfig({ key, direction });

  };

 

  React.useEffect(() => {

    const showNavbar = (

      toggleId: string,

      navId: string,

      bodyId: string,

      headerId: string

    ) => {

      const toggle = document.getElementById(toggleId);

      const nav = document.getElementById(navId);

      const bodypd = document.getElementById(bodyId);

      const headerpd = document.getElementById(headerId);

      UserGet();

      if (toggle && nav && bodypd && headerpd) {

        toggle.addEventListener("click", () => {

          nav.classList.toggle("show");

          toggle.classList.toggle("bx-x");

          bodypd.classList.toggle("body-pd");

          headerpd.classList.toggle("body-pd");

        });

      }

    };

 

    showNavbar("header-toggle", "nav-bar", "body-pd", "header");

 

    const linkColor = document.querySelectorAll(".nav_link");

 

    function colorLink(this: HTMLElement) {

      if (linkColor) {

        linkColor.forEach((l) => l.classList.remove("active"));

        this.classList.add("active");

      }

    }

 

    linkColor.forEach((l) => l.addEventListener("click", colorLink));

  }, [useHide]);

 

  const UserGet = async () => {

    const users = await sp.web.siteUsers();

    console.log(users, "users");

  };

 

  const handleRedirect = async (Item: any) => {

    let redirecturl = "";
    if (activeTab == "Automation"){
      window.open(Item.RedirectionLink, "_blank");

    } else if (activeTab == "Intranet"){
     
      let sessionkey = "";
     
      if (Item?.ProcessName) {
        switch (Item?.ProcessName) {
          case "Announcement":
            sessionkey = "announcementId";
            redirecturl = `${siteUrl}/SitePages/AddAnnouncement.aspx` + "?requestid=" + Item?.Id + "&mode=view";
            break;
            case "News":
              sessionkey = "announcementId";
              redirecturl = `${siteUrl}/SitePages/AddAnnouncement.aspx` + "?requestid=" + Item?.Id + "&mode=view";
              break;
          case "Event":
            sessionkey = "EventId";
            redirecturl = `${siteUrl}/SitePages/EventMasterForm.aspx` + "?requestid=" + Item?.Id + "&mode=view";
            break;
          case "Media":
            sessionkey = "mediaId";
            redirecturl = `${siteUrl}/SitePages/MediaGalleryForm.aspx` + "?requestid=" + Item?.Id + "&mode=view";
            break;
          default: ;
        }
  
        const encryptedId = encryptId(String(Item?.ContentId));
        sessionStorage.setItem(sessionkey, encryptedId);
        location.href = redirecturl;
  
      }
    } else if (activeTab == "DMS"){
     
      // window.location.href = `${siteUrl}/SitePages/DMS.aspx?${Item?.ContentId}`;
    }
  };
  const getTaskItemsbyID = async ( itemid:any)=>{
    // currentItemID = itemid
    // setDMSMyreq("false");
   
    currentItemID = itemid
    // alert(DMSMyreq)
    // setMainCardBody('DMS')
    console.log("itemid" , itemid)
    const items = await sp.web.lists.getByTitle('DMSFileApprovalTaskList').items.select("CurrentUser" , "FileUID/FileUID" , "Log").expand("FileUID").filter(`FileUID/RequestNo eq '${itemid}'`)();
       console.log(items , "items")
  }
  let DMSMyreq = 'true'
  // const [DMSMyreq , setDMSMyreq] = useState('true')
  const handleReturnToMain = (Name:any) => {
    DMSMyreq = 'true'
    // setDMSMyreq("true"); // Reset to show the main component
    console.log(DMSMyreq , "activeComponent updated")
  };
  const [showNestedDMSTable, setShowNestedDMSTable] = useState(""); // Tracks nested table for DMS
  // const [showNestedDMSTable2, setShowNestedDMSTable2] = useState("DMSPreview"); // Tracks nested table for DMS

  // const handleTabClick = (tab: string) => {
  //   setActiveTab(tab);
  //   if (tab !== "DMS") {
  //     setShowNestedDMSTable(false); // Reset nested DMS table if another tab is clicked
  //   }
  // };
  const handleShowNestedDMSTable = (value: string) => {
    alert(value)
    setShowNestedDMSTable(value); // Show nested table within DMS
    if(value == "DMSFilePreview"){
      setShowModal(true);
  };
}
  // const [showModal, setShowModal] = useState(false);
  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => {
    setShowModal(false);
    setShowNestedDMSTable("");
  };

  return (

    <div id="wrapper" ref={elementRef}>

      <div className="app-menu" id="myHeader">

        <VerticalSideBar _context={sp} />

      </div>

 

      <div className="content-page">

        <HorizontalNavbar/>

        <div

          className="content"

          style={{

            marginLeft: `${!useHide ? "240px" : "80px"}`,

            marginTop: "0rem",

          }}>

          <div className="container-fluid paddb">

            <div className="row" style={{ paddingLeft: "0.5rem" }}>

              <div className="col-lg-6">

                {/* <CustomBreadcrumb Breadcrumb={Breadcrumb} /> */}

              </div>

            </div>
            <div className="row mt-4">

<div className="col-12">

  <div className="card mb-0 cardcsss">

    <div className="card-body">
            <div className="d-flex flex-wrap align-items-center justify-content-center">

              <ul

                className="nav nav-pills navtab-bg float-end"

                role="tablist"

              >

                <li className="nav-item" role="presentation">

                  <a


                    onClick={() => handleTabClick("Intranet")}

                    className={`nav-link ${activeTab === "Intranet" ? "active" : ""

                      }`}

                    aria-selected={activeTab === "Intranet"}

                    role="tab"

                  >

                    Intranet

                  </a>

                </li>

                <li className="nav-item" role="presentation">

                  <a


                    onClick={() => handleTabClick("DMS")}

                    className={`nav-link ${activeTab === "DMS" ? "active" : ""

                      }`}

                    aria-selected={activeTab === "DMS"}

                    role="tab"

                    tabIndex={-1}

                  >

                    DMS

                  </a>

                </li>

                <li className="nav-item" role="presentation">

                  <a


                    onClick={() => handleTabClick("Automation")}

                    className={`nav-link ${activeTab === "Automation" ? "active" : ""

                      }`}

                    aria-selected={activeTab === "Automation"}

                    role="tab"

                    tabIndex={-1}

                  >

                    Automation

                  </a>

                </li>

              </ul>

            </div>
</div></div></div> </div>
            <div className="card cardCss mt-4">
          
              <div className="card-body">

              <div id="cardCollpase4" className="collapse show">

                <div className="table-responsive pt-0">
                 {
                  activeTab === "Intranet" || activeTab === "Automation" ? (

                    <>
                    <table
 
 className="mt-0 mtable table-centered table-nowrap table-borderless mb-0"
 
 style={{ position: "relative" }}
 
 >
 
 <thead>
 
   <tr>
 
     <th
 
       style={{
 
        
 
         minWidth: "40px",
 
         maxWidth: "40px",
 
         
 
       }}
 
     >
 
       <div
 
         className="d-flex pb-2"
 
         style={{ justifyContent: "space-between" }}
 
       >
 
         <span>S.No.</span>
 
         <span onClick={() => handleSortChange("SNo")}>
 
           <FontAwesomeIcon icon={faSort} />
 
         </span>
 
       </div>
 
       <div className="bd-highlight">
 
         <input
 
           type="text"
 
           placeholder="index"
 
           onChange={(e) => handleFilterChange(e, "SNo")}
 
           className="inputcss"
 
           style={{ width: "100%" }}
 
         />
 
       </div>
 
     </th>
 
     <th style={{ minWidth: "80px", maxWidth: "80px" }}>
 
       <div className="d-flex flex-column bd-highlight ">
 
         <div
 
           className="d-flex pb-2"
 
           style={{ justifyContent: "space-between" }}
 
         >
 
           <span>Request ID</span>
 
           <span
 
             onClick={() => handleSortChange("RequestID")}
 
           >
 
             <FontAwesomeIcon icon={faSort} />
 
           </span>
 
         </div>
 
         <div className=" bd-highlight">
 
           <input
 
             type="text"
 
             placeholder="Filter by Request ID"
 
             onChange={(e) =>
 
               handleFilterChange(e, "RequestID")
 
             }
 
             className="inputcss"
 
             style={{ width: "100%" }}
 
           />
 
         </div>
 
       </div>
 
     </th>
 
     <th style={{ minWidth: "120px", maxWidth: "120px" }}>
 
       <div className="d-flex flex-column bd-highlight ">
 
         <div
 
           className="d-flex  pb-2"
 
           style={{ justifyContent: "space-between" }}
 
         >
 
           <span>Process Name</span>{" "}
 
           <span
 
             onClick={() =>
 
               handleSortChange("ProcessName")
 
             }
 
           >
 
             <FontAwesomeIcon icon={faSort} />{" "}
 
           </span>
 
         </div>
 
         <div className=" bd-highlight">
 
           <input
 
             type="text"
 
             placeholder="Filter by Process Name"
 
             onChange={(e) =>
 
               handleFilterChange(e, "ProcessName")
 
             }
 
             className="inputcss"
 
             style={{ width: "100%" }}
 
           />
 
         </div>
 
       </div>
 
     </th>
 
     <th style={{ minWidth: "100px", maxWidth: "100px" }}>
 
       <div className="d-flex flex-column bd-highlight ">
 
         <div
 
           className="d-flex  pb-2"
 
           style={{ justifyContent: "space-between" }}
 
         >
 
           <span>Requested By</span>{" "}
 
           <span
 
             onClick={() =>
 
               handleSortChange("RequestedBy")
 
             }
 
           >
 
             <FontAwesomeIcon icon={faSort} />{" "}
 
           </span>
 
         </div>
 
         <div className=" bd-highlight">
 
           <input
 
             type="text"
 
             placeholder="Filter by Approver By"
 
             onChange={(e) =>
 
               handleFilterChange(e, "RequestedBy")
 
             }
 
             className="inputcss"
 
             style={{ width: "100%" }}
 
           />
 
         </div>
 
       </div>
 
     </th>
 
     <th style={{ minWidth: "80px", maxWidth: "80px" }}>
 
       <div className="d-flex flex-column bd-highlight ">
 
         <div
 
           className="d-flex  pb-2"
 
           style={{ justifyContent: "space-between" }}
 
         >
 
           <span>Status</span>{" "}
 
           <span
 
             onClick={() => handleSortChange("Status")}
 
           >
 
             <FontAwesomeIcon icon={faSort} />{" "}
 
           </span>
 
         </div>
 
         <div className=" bd-highlight">
 
           <input
 
             type="text"
 
             placeholder="Filter by Status"
 
             onChange={(e) =>
 
               handleFilterChange(e, "Status")
 
             }
 
             className="inputcss"
 
             style={{ width: "100%" }}
 
           />
 
         </div>
 
       </div>
 
     </th>
 
     <th style={{ minWidth: "100px", maxWidth: "100px", verticalAlign:"Top" }}>
 
       <div className="d-flex flex-column bd-highlight ">
 
         <div
 
           className="d-flex  pb-2"
 
           style={{ justifyContent: "space-between" }}
 
         >
 
           <span>Requested Date</span>{" "}
 
           <span
 
             onClick={() =>
 
               handleSortChange("RequestedDate")
 
             }
 
           >
 
             <FontAwesomeIcon icon={faSort} />{" "}
 
           </span>
 
         </div>
 
         <div className=" bd-highlight">
 
          <input
 
             type="text"
 
             placeholder="Filter by Requested Date"
 
             onChange={(e) =>
 
               handleFilterChange(e, "RequestedDate")
 
             }
 
             className="inputcss"
 
             style={{ width: "100%" }}
 
           />
 
         </div>
 
       </div>
 
     </th>
 
 
 
     <th
 
       style={{
 
         minWidth: "50px",
 
         maxWidth: "50px",                           
        textAlign: "center",
 
         verticalAlign: "top",
 
       }}
 
     >
 
       <div className="d-flex flex-column bd-highlight ">
 
         <div
 
           className="d-flex  pb-2"
 
           style={{ justifyContent: "space-between" }}
 
         >
 
           <span>Action</span>{" "}
 
           {/* <span
 
             onClick={() => handleSortChange("Category")}
 
           >
 
             <FontAwesomeIcon icon={faSort} />{" "}
 
           </span> */}
 
         </div>
 
         {/* <div className=" bd-highlight">
 
           <input
 
             type="text"
 
             placeholder="Filter by Requested By"
 
             onChange={(e) =>
 
               handleFilterChange(e, "Category")
 
             }
 
             className="inputcss"
 
             style={{ width: "100%" }}
 
           />
 
         </div> */}
 
       </div>
 
     </th>
 
   </tr>
 
 </thead>
 
 <tbody>
 
   {currentData?.length === 0 ? (
 
     <div
 
       className="no-results"
 
       style={{
 
         display: "flex",
 
         justifyContent: "center",
 
       }}
 
     >
 
       No results found
 
     </div>
 
   ) : (
 
     currentData?.map((item: any, index: number) => (
 
       <tr
 
         onClick={() =>
 
           handleRedirect(item.RedirectionLink)
 
         }
 
         key={index}
 
         style={{ cursor: "pointer" }}
 
       >
 
         <td
 
           style={{ minWidth: "40px", maxWidth: "40px" }}
 
         >
 
           {startIndex + index + 1}
 
         </td>
 
         <td
 
           style={{
 
             minWidth: "80px",
 
             maxWidth: "80px",
 
             textTransform: "capitalize",
 
           }}
 
         >
 
           {/* {item.RequestID} */}
           {item.RequestID}
 
         </td>
 
         <td
 
           style={{ minWidth: "120px", maxWidth: "120px" }}
 
         >
 
           {/* {item.ProcessName} */}
           {item.ProcessName}
 
         </td>
 
         <td
 
           style={{ minWidth: "100px", maxWidth: "100px" }}
 
         >
 
         {activeTab =="Automation" ?item?.Author.Title : item?.Requester?.Title}
 
         </td>
 
 
 
         <td
 
           style={{ minWidth: "80px", maxWidth: "80px" }}
 
         >
 <div className="btn btn-status">
           {item?.Status}</div>
 
         </td>
 
         <td
 
           style={{ minWidth: "100px", maxWidth: "100px" }}
 
         >
 
           {new Date(item?.Created).toLocaleDateString()}
 
         </td>
 
         <td
 
           style={{ minWidth: "50px", maxWidth: "50px" }}
 
           className="fe-eye font-18"
 
         >
 
           {/* <a href="my-approval-form.html"><i className="fe-eye font-18"></i> </a> */}
 
 
 
           {/* <img
 
             onClick={() =>
 
               handleRedirect(item.RedirectionLink)
 
             }
 
             style={{
 
               minWidth: "20px",
 
               maxWidth: "20px",
 
               marginLeft: "15px",
 
               cursor: "pointer",
 
             }}
 
             src={require("../assets/eye.png")}
 
             className="fe-eye font-18"
 
             alt={item.Title || "Untitled"}
 
           /> */}
 
 
 <Eye onClick={() =>
 
 handleRedirect(item)
 
 }
 
 style={{
 
 minWidth: "20px",
 
 maxWidth: "20px",
 
 marginLeft: "15px",
 
 cursor: "pointer",
 
 }} />
 
          
 
         </td>
 
       </tr>
 
     ))
 
   )}
 
 </tbody>
 
                    </table>
                   </> 
                  ): 
                  null
                }
                    {activeTab === "DMS" && (
          <div>
            {showNestedDMSTable === "" ? (
              <div>

                <table
 
 className="mt-0 mtable table-centered table-nowrap table-borderless mb-0"
 
 style={{ position: "relative" }}
 
 >
 
 <thead>
 
   <tr>
   {/*Table sr no */}
     <th
 
       style={{
 
        
 
         minWidth: "40px",
 
         maxWidth: "40px",
 
         
 
       }}
 
     >
 
       <div
 
         className="d-flex pb-2"
 
         style={{ justifyContent: "space-between" }}
 
       >
 
         <span>S.No.</span>
 
         <span onClick={() => handleSortChange("SNo")}>
 
           <FontAwesomeIcon icon={faSort} />
 
         </span>
 
       </div>
 
       <div className="bd-highlight">
 
         <input
 
           type="text"
 
           placeholder="index"
 
           onChange={(e) => handleFilterChange(e, "SNo")}
 
           className="inputcss"
 
           style={{ width: "100%" }}
 
         />
 
       </div>
 
     </th>
       {/*Table req ID */}
     <th style={{ minWidth: "80px", maxWidth: "80px" }}>
 
       <div className="d-flex flex-column bd-highlight ">
 
         <div
 
           className="d-flex pb-2"
 
           style={{ justifyContent: "space-between" }}
 
         >
 
           <span>Request ID</span>
 
           <span
 
             onClick={() => handleSortChange("RequestID")}
 
           >
 
             <FontAwesomeIcon icon={faSort} />
 
           </span>
 
         </div>
 
         <div className=" bd-highlight">
 
           <input
 
             type="text"
 
             placeholder="Filter by Request ID"
 
             onChange={(e) =>
 
               handleFilterChange(e, "RequestID")
 
             }
 
             className="inputcss"
 
             style={{ width: "100%" }}
 
           />
 
         </div>
 
       </div>
 
     </th>
  {/*Table Title*/}
  <th style={{ minWidth: "80px", maxWidth: "80px" }}>
 
 <div className="d-flex flex-column bd-highlight ">

   <div

     className="d-flex pb-2"

     style={{ justifyContent: "space-between" }}

   >

     <span>Title</span>

     <span

       onClick={() => handleSortChange("Title")}

     >

       <FontAwesomeIcon icon={faSort} />

     </span>

   </div>

   <div className=" bd-highlight">

     <input

       type="text"

       placeholder="Filter by Title"

       onChange={(e) =>

         handleFilterChange(e, "Title")

       }

       className="inputcss"

       style={{ width: "100%" }}

     />

   </div>

 </div>

   </th>
     <th style={{ minWidth: "120px", maxWidth: "120px" }}>
 
       <div className="d-flex flex-column bd-highlight ">
 
         <div
 
           className="d-flex  pb-2"
 
           style={{ justifyContent: "space-between" }}
 
         >
 
           <span>Process Name</span>{" "}
 
           <span
 
             onClick={() =>
 
               handleSortChange("ProcessName")
 
             }
 
           >
 
             <FontAwesomeIcon icon={faSort} />{" "}
 
           </span>
 
         </div>
 
         <div className=" bd-highlight">
 
           <input
 
             type="text"
 
             placeholder="Filter by Process Name"
 
             onChange={(e) =>
 
               handleFilterChange(e, "ProcessName")
 
             }
 
             className="inputcss"
 
             style={{ width: "100%" }}
 
           />
 
         </div>
 
       </div>
 
     </th>
 
     <th style={{ minWidth: "100px", maxWidth: "100px" }}>
 
       <div className="d-flex flex-column bd-highlight ">
 
         <div
 
           className="d-flex  pb-2"
 
           style={{ justifyContent: "space-between" }}
 
         >
 
           <span>Requested By</span>{" "}
 
           <span
 
             onClick={() =>
 
               handleSortChange("RequestedBy")
 
             }
 
           >
 
             <FontAwesomeIcon icon={faSort} />{" "}
 
           </span>
 
         </div>
 
         <div className=" bd-highlight">
 
           <input
 
             type="text"
 
             placeholder="Filter by Approver By"
 
             onChange={(e) =>
 
               handleFilterChange(e, "RequestedBy")
 
             }
 
             className="inputcss"
 
             style={{ width: "100%" }}
 
           />
 
         </div>
 
       </div>
 
     </th>
 
     <th style={{ minWidth: "80px", maxWidth: "80px" }}>
 
       <div className="d-flex flex-column bd-highlight ">
 
         <div
 
           className="d-flex  pb-2"
 
           style={{ justifyContent: "space-between" }}
 
         >
 
           <span>Status</span>{" "}
 
           <span
 
             onClick={() => handleSortChange("Status")}
 
           >
 
             <FontAwesomeIcon icon={faSort} />{" "}
 
           </span>
 
         </div>
 
         <div className=" bd-highlight">
 
           <input
 
             type="text"
 
             placeholder="Filter by Status"
 
             onChange={(e) =>
 
               handleFilterChange(e, "Status")
 
             }
 
             className="inputcss"
 
             style={{ width: "100%" }}
 
           />
 
         </div>
 
       </div>
 
     </th>
 
     <th style={{ minWidth: "100px", maxWidth: "100px", verticalAlign:"Top" }}>
 
       <div className="d-flex flex-column bd-highlight ">
 
         <div
 
           className="d-flex  pb-2"
 
           style={{ justifyContent: "space-between" }}
 
         >
 
           <span>Requested Date</span>{" "}
 
           <span
 
             onClick={() =>
 
               handleSortChange("RequestedDate")
 
             }
 
           >
 
             <FontAwesomeIcon icon={faSort} />{" "}
 
           </span>
 
         </div>
 
         <div className=" bd-highlight">
 
          <input
 
             type="text"
 
             placeholder="Filter by Requested Date"
 
             onChange={(e) =>
 
               handleFilterChange(e, "RequestedDate")
 
             }
 
             className="inputcss"
 
             style={{ width: "100%" }}
 
           />
 
         </div>
 
       </div>
 
     </th>
 
 
 
     <th
 
       style={{
 
         minWidth: "50px",
 
         maxWidth: "50px",                           
        textAlign: "center",
 
         verticalAlign: "top",
 
       }}
 
     >
 
       <div className="d-flex flex-column bd-highlight ">
 
         <div
 
           className="d-flex  pb-2"
 
           style={{ justifyContent: "space-between" }}
 
         >
 
           <span>View Detail</span>{" "}
 
      
 
         </div>
 
 
       </div>
 
     </th>
       
     <th

style={{

  minWidth: "50px",

  maxWidth: "50px",
  textAlign: "center",

  verticalAlign: "top",

}}

>

<div className="d-flex flex-column bd-highlight ">

  <div

    className="d-flex  pb-2"

    style={{ justifyContent: "space-between" }}

  >

    <span>Audit History</span>{" "}


  </div>



</div>

</th>
   </tr>
 
 </thead>
 
 <tbody>
 
   {currentData?.length === 0 ? (
 
     <div
 
       className="no-results"
 
       style={{
 
         display: "flex",
 
         justifyContent: "center",
 
       }}
 
     >
 
       No results found
 
     </div>
 
   ) : (
 
     currentData?.map((item: any, index: number) => (
 
       <tr
 
         onClick={() =>
 
           handleRedirect(item.RedirectionLink)
 
         }
 
         key={index}
 
         style={{ cursor: "pointer" }}
 
       >
 
         <td
 
           style={{ minWidth: "40px", maxWidth: "40px" }}
 
         >
 
           {startIndex + index + 1}
 
         </td>
 
         <td
 
           style={{
 
             minWidth: "80px",
 
             maxWidth: "80px",
 
             textTransform: "capitalize",
 
           }}
 
         >
 
           {/* {item.RequestID} */}
           {item.FileUID}
 
         </td>
 
         <td
 
           style={{
 
             minWidth: "80px",
 
             maxWidth: "80px",
 
             textTransform: "capitalize",
 
           }}
 
         >
 
           {/* {item.RequestID} */}
           {item.FileName}
 
         </td>
 
         <td
 
           style={{ minWidth: "120px", maxWidth: "120px" }}
 
         >
 
           {/* {item.ProcessName} */}
           DMS
 
         </td>
 
         <td
 
           style={{ minWidth: "100px", maxWidth: "100px" }}
 
         >
 
         {item?.CurrentUser}
 
         </td>
 
 
 
         <td
 
           style={{ minWidth: "80px", maxWidth: "80px" }}
 
         >
          <div className="btn btn-status">
            <a onClick={() => {getTaskItemsbyID(item.FileUID) ; handleShowNestedDMSTable("DMSFilePreview")}}> {item?.Status}</a>
          </div>
 
         </td>
 
         <td
 
           style={{ minWidth: "100px", maxWidth: "100px" }}
 
         >
 
           {new Date(item?.Created).toLocaleDateString()}
 
         </td>
 
         <td
 
           style={{ minWidth: "50px", maxWidth: "50px" }}
 
           className="fe-eye font-18"
 
         >
 
 
 
 <Eye onClick={() => {getTaskItemsbyID(item.FileUID) ; handleShowNestedDMSTable("DMSAuditHistory")}}
 
 style={{
 
 minWidth: "20px",
 
 maxWidth: "20px",
 
 marginLeft: "15px",
 
 cursor: "pointer",
 
 }} />
 
          
 
         </td>
         <td
 
           style={{ minWidth: "50px", maxWidth: "50px" }}
 
           className="fe-eye font-18"
 
         >
 
 <FontAwesomeIcon style={{ minWidth: "20px", maxWidth: "20px", marginLeft: "15px", cursor: "pointer" }}
                                        icon={faSearch} onClick={() => {getTaskItemsbyID(item.FileUID) ; handleShowNestedDMSTable("DMSFilePreview")}}
                                      />
 
 {/* <Eye onClick={() => {getTaskItemsbyID(item.FileUID) ; handleShowNestedDMSTable()}}
 
 style={{
 
 minWidth: "20px",
 
 maxWidth: "20px",
 
 marginLeft: "15px",
 
 cursor: "pointer",
 
 }} />
  */}
          
 
         </td>
 
       </tr>
 
     ))
 
   )}
 
 </tbody>
 
                    </table>
                
              </div>
            ) 
            : 
            showNestedDMSTable === "DMSFilePreview" ? 
(
  <Modal show={showModal} onHide={handleCloseModal}>
    <Modal.Header closeButton>
      <Modal.Title>DMS Audit History</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <DMSMyrequestLog props={currentItemID} />
    </Modal.Body>
    <Modal.Footer>
      <Button variant="secondary" onClick={handleCloseModal}>
        Close
      </Button>
    </Modal.Footer>
  </Modal>
)
            : 
            showNestedDMSTable === "DMSAuditHistory" ?
             (
              <div>
              <div>
                  <div>
                 <button style={{float:'right'}} type="button" className="btn btn-secondary" onClick={() => setShowNestedDMSTable("")}> Back </button>
                <DMSMyrequestLog props={currentItemID}/>
                  </div>
              </div>
            </div>
            )
           
            :
            null}
          </div>
        )}
                           
                  
               
                  

                 
                 
                 
                </div>
                



                {currentData?.length > 0 ? (

                  <nav className="pagination-container">

                    <ul className="pagination">

                      <li style={{margin:'0px'}}

                        className={`page-item ${currentPage === 1 ? "disabled" : ""

                          }`}

                      >

                        <a

                          className="page-link"

                          onClick={() => handlePageChange(currentPage - 1)}

                          aria-label="Previous"

                        >

                          «

                        </a>

                      </li>

                      {Array.from({ length: totalPages }, (_, num) => (

<li style={{margin:'0px'}}

                          key={num}

                          className={`page-item ${currentPage === num + 1 ? "active" : ""

                            }`}

                        >

                          <a

                            className="page-link"

                            onClick={() => handlePageChange(num + 1)}

                          >

                            {num + 1}

                          </a>

                        </li>

                      ))}



<li style={{margin:'0px'}}

                        className={`page-item ${currentPage === totalPages ? "disabled" : ""

                          }`}

                      >

                        <a

                          className="page-link"

                          onClick={() => handlePageChange(currentPage + 1)}

                          aria-label="Next"

                        >

                          »

                        </a>

                      </li>

                    </ul>

                  </nav>

                ) : (

                  <></>

                )}

              </div>

            </div>
             

             
              

            </div>

        

          </div>

        </div>

      </div>

    </div>

  );

};

 

 

const MyRequest: React.FC<IMyRequestProps> = (props) => (

  <Provider>

    <MyRequestContext props={props} />

  </Provider>

);

export default MyRequest;



 


