import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAnnouncement, editAnnouncement } from '../../api/Announcements';
import BackButton from '../../components/BackButton';

export default function EditAnnouncement() {
  const { id } = useParams();
  const [title, setTitle] = useState("");
  const [header, setHeader] = useState("");
  const [content, setContent] = useState("");
  const [color, setColor] = useState("");
  const [initialData, setInitialData] = useState({
    title: "",
    header: "",
    content: "",
    color: "",
  });

  const isModified =
    title !== initialData.title ||
    header !== initialData.header ||
    color !== initialData.color ||
    content !== initialData.content;

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        const data = await getAnnouncement(id);
        setTitle(data.title);
        setHeader(data.header);
        setContent(data.content);
        setColor(data.color);
        setInitialData({
          title: data.title,
          header: data.header,
          content: data.content,
          color: data.color,
        });
      } catch (error) {
        console.error("Error fetching announcement:", error);
      }
    };
  
    fetchAnnouncement();
  }, [id]);
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isModified) return;

    if (!title || !header || !content || !color) {
      alert("All fields are required");
      return;
    }

    try {
      const response = await editAnnouncement(id, title, header, content, color);
      alert("Announcement updated successfully!");
      console.log(response);
    } catch (error) {
      alert("There was an error while updating the announcement.");
      console.error(error);
    }
  };

  return (
    <main className="flex flex-col flex-grow">
      <div className="text-center pt-10 mt-26">
        <div className="inline-block bg-green-700 text-white text-2xl font-bold px-6 py-3 rounded-md shadow-md">
          Edit Announcement
        </div>
      </div>

      <div className="flex flex-col items-center mt-10"> 
        <form onSubmit={handleSubmit}>
        <div className="bg-neutral-800 p-6 rounded-md shadow-md mx-6 w-200">
           <div className="flex flex-col space-y-6 w-full max-w-md mx-auto">
            <div className="flex flex-col w-full">
              <label htmlFor="announcementTitle" className="text-white font-lg font-bold">Title</label>
              <input
                id="announcementTitle"
                type="text"
                className="border text-black border-gray-300 bg-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-black"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="flex flex-col w-full">
              <label htmlFor="announcementHeader" className="text-white font-lg font-bold">Header</label>
              <input
                id="announcementHeader"
                type="text"
                className="border text-black border-gray-300 bg-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-black"
                value={header}
                onChange={(e) => setHeader(e.target.value)}
              />
            </div>

            <div className="flex flex-col w-full justify-center items-center">
              <label htmlFor="announcementColor" className="text-white font-lg font-bold">Color</label>
              <input
                id="announcementColor"
                type="color"
                className="border text-black border-gray-300 bg-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-black"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
            </div>
          </div>

            <div className="p-4 rounded-md border-0">
              <div className="flex-grow container mx-auto mt-4">
                <label htmlFor="announcementContent" className="block text-white font-lg font-bold pb-2">
                  Content
                </label>
                <textarea
                  id="announcementContent"
                  className="w-180 border border-gray-300 bg-white text-black p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  rows="4"
                  placeholder="Enter content..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex text-center gap-8 items-center justify-center mt-4">
            <BackButton />
            <button
              type="submit"
              disabled={!isModified}
              className={`p-2 rounded w-40 text-white transition-colors duration-200 ${
                isModified
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-gray-500"
              }`}
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
