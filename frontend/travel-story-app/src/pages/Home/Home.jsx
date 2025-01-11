import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../utils/axiosInstance";
import TravelStoryCard from '../../components/Cards/TravelStoryCard';
import Modal from "react-modal";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { MdAdd } from "react-icons/md";
import AddEditTravelStory from './AddEditTravelStory';
import ViewTravelStory from './ViewTravelStory';
import EmptyCard from '../../components/Cards/EmptyCard';
import Emptyphoto from '../../assets/images/notravel.jpg';
import { DayPicker } from 'react-day-picker';
import moment from 'moment';
import FilterInfoTitle from '../../components/Cards/FilterInfoTitle';
import { getEmptyCardImg, getEmptyCardMessage } from '../../../utils/helper';

const Home = () => {
  const navigate = useNavigate();
  
  const [userInfo, setUserInfo] = useState(null);
  const [allStories, setAllStories] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("");

  const [dateRange, setDateRange] = useState({ from: null, to: null});

  const [openAddEditModal, setOpenAddEditModal] = useState({
    isShown: false,
    type: "add",
    data: null,
  });

  const [openViewModel, setOpenViewModal] = useState({
    isShown: false,
    data: null,
  });
  // Get user Info
  const getUserInfo = async () => {
    try{
      const response = await axiosInstance.get("/get-user");
      if(response.data && response.data.user){
        // Set User info if data exists
        setUserInfo(response.data.user);
      }
    } catch(error){
      if(error.response.status === 401){
        // Clear storage if unauthorized
        localStorage.clear();
        navigate("/login"); // Redirect to login
      }
    }
  };

  //Get all travel stories
  const getAllTravelStories = async() => {
    try{
      const response = await axiosInstance.get("/get-all-stories");
      if(response.data && response.data.stories){
        setAllStories(response.data.stories);
      }
    } catch(error){
      console.log("An unexpected error occurred.Please try again.");
    }
  }

  // Handle Edit Stroy Click
  const handleEdit = (data) => {
    setOpenAddEditModal({isShown: true, type: "edit", data: data});
  }

  // Handle Travel Story Click
  const handleViewStory = (data) => {
    setOpenViewModal({ isShown: true, data});
  };


  const updateIsFavourite = async (storyData) => {
    const storyId = storyData._id;
    try{
      const response = await axiosInstance.put(
        "update-is-favourite/" + storyId,
        {
          isFavourite: !storyData.isFavourite,
        }
      );

      if(response.data && response.data.story){
        toast.success("Story Updated successfully!")
        if(filterType === "search" && searchQuery){
          onSearchStory(searchQuery);
        } else if(filterType === "date"){
          filterStoriesByDate(dateRange);
        } else{
          getAllTravelStories();
        }
      }
    }
    catch(error){
      console.log("An unexpexted error occurred. PLease try again.");
    }
  };

  const deleteTravelStory = async(data) => {
    const storyId = data._id;

    try{
      const response = await axiosInstance.delete("/delete-story/" + storyId);

      if(response.data && !response.data.error) {
        toast.error("Stroy Deleted Successfully");
        setOpenViewModal((prevState) => ({...prevState, isShown : false }));
        getAllTravelStories();
      }
    } catch (error) {
        console.log("An unexpected error occurred. Please try again.");
      }
  }

  //Search Story
  const onSearchStory = async(query) => {
    
    try{
      const response = await axiosInstance.get("/search", {
        params: {
          query,
        }
      });
      if(response.data && response.data.stories) {
        setFilterType("search");
        setAllStories(response.data.stories);
      }
    } catch (error) {
      console.log("An unexpected error occurred. Please try again.");
    }
  }
  
  const handleClearSearch = () => {
    setFilterType("");
    getAllTravelStories();
  };
  // Handle Filter Travel Story By Date Range
  const filterStoriesByDate = async (range) => {
    try{
      const startDate = range.from ? moment(range.from).valueOf() : null;
      const endDate = range.to ? moment(range.to).valueOf() : null;

      if(startDate && endDate) {
        const response = await axiosInstance.get("/travel-stories/filter", {
          params: { startDate, endDate},
        });
        if(response.data && response.data.stories){
          setFilterType("date");
          setAllStories(response.data.stories);
        }
      }
    } catch(error){
      console.log('An unexpected error occurred. Please try again.');
    }
  };


  //Handle Date Range Select 
  const handleDayClick = (range) => {
    setDateRange(range);
    if (range.from && range.to) {
      filterStoriesByDate(range);
    }
  };
  
  const resetFilter = (day) => {
    setDateRange({from : null, to: null});
    setFilterType("");
    getAllTravelStories;
  }
  useEffect(() => {
    getAllTravelStories();
    getUserInfo();
  }, []
  ); // Ensure no stale dependencies
  
  return (
    <>
      <Navbar  
      userInfo = {userInfo} 
      searchQuery={searchQuery} 
      setSearchQuery={setSearchQuery}
      onSearchNote={onSearchStory}
      handleClearSearch={handleClearSearch}
      />
      <div className='container mx-auto py-10'>

        <FilterInfoTitle
          filterType={filterType}
          filterDates={dateRange}
          onClear={() => {
            resetFilter();
          }}
          />
        <div className='flex gap-7'>
          <div className='flex-1'>
            {allStories.length > 0 ? (
              <div className='grid grid-cols-2 gap-4'>
                {allStories.map((item) => {
                  return (
                    <TravelStoryCard
                      key={item._id}
                      imgUrl={item.imageUrl}
                      title={item.title}
                      story={item.story}
                      date={item.visitedDate}
                      visitedLocation={item.visitedLocation}
                      isFavourite={item.isFavourite}
                      onClick={() => handleViewStory(item)}
                      onFavouriteClick={() => updateIsFavourite(item)}
                      />
                    );
                  })}
              </div>
            ) : (
              <EmptyCard imgSrc={getEmptyCardImg(filterType)}
              message={getEmptyCardMessage (filterType)} />
            )}
          </div>
          <div className='w-[350px]'>
            <div className='bg-white border border-slate-200 shadow-lg shadow-slate-200/60 rounded-lg'>
              <div className='p-3'>
                <DayPicker
                  captionLayout="dropdown-buttons"
                  mode="range"
                  selected={dateRange}
                  onSelect={handleDayClick}
                  pagedNavigation />
              </div>
            </div>
          </div>
        </div>
      </div>

      { /*  Add & Edit travel story model */ }
      <Modal 
      isOpen={openAddEditModal.isShown}
      onRequestClose={() => {}}
      style ={{ 
        overlay: {
          backgroundColor: "rgba(0,0,0,0.2)",
          zIndex: 999,
        },
       }}
       appElement={document.getElementById("root")}
       className="model-box"
       >
        <AddEditTravelStory
        type={openAddEditModal.type}
        storyInfo={openAddEditModal.data}
        onClose={() => setOpenAddEditModal({ isShown: false, type: "add", data: null })}
        getAllTravelStories={getAllTravelStories} // Pass this function
        setAllStories={setAllStories} // Allow dynamic state updates
        />

       </Modal>

       { /*  View travel story model */ }
      <Modal 
      isOpen={openViewModel.isShown}
      onRequestClose={() => {}}
      style ={{ 
        overlay: {
          backgroundColor: "rgba(0,0,0,0.2)",
          zIndex: 999,
        },
       }}
       appElement={document.getElementById("root")}
       className="model-box"
       >
        <ViewTravelStory storyInfo={openViewModel.data || null} 
        onClose={()=>{
          setOpenViewModal((prevState) => ({...prevState, isShown: false }));
        }}
        onEditClick={()=>{
          setOpenViewModal((prevState) => ({...prevState, isShown: false }));
          handleEdit(openViewModel.data || null);
        }}
        onDeleteClick={() =>{
          deleteTravelStory(openViewModel.data || null);
        }}
         />

       </Modal>
      <button
        className='w-16 h-16 flex items-center justify-center rounded-full bg-primary hover:bg-pink-400 fixed right-10 bottom-10'
        onClick={() =>{
          setOpenAddEditModal({isShown: true, type: "add", data: null});
        }}
      >
        <MdAdd className='text-[32px] text-white' />
      </button>

      <ToastContainer/>
    </>
  )
}

export default Home