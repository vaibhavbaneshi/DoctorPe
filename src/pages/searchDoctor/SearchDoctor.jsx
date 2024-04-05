import { useEffect, useState } from "react";
import { DoctorCard } from "../../components/Card/DoctorCard";
import axios from "axios";
import Heading from '../../components/products/Heading.jsx';
import { useSelector } from "react-redux";
import randomString from "crypto-random-string";
import { sendDoctorConsult, sendPatientConsult } from "../../components/Email/EmailSend.js";
import ChatBotButton from "../../components/ChatBot/ChatBotButton.jsx";
import Flash from "react-awesome-reveal";

export const SearchDoctor = () => {
    const [users, setUsers] = useState([]);
    const [selectedSpecialty, setSelectedSpecialty] = useState("ALL");
    const { currentUser } = useSelector(state => state.user);
    const [showAlert, setShowAlert] = useState(false);
    const [ count, setCount ] = useState(5);

    const getRandomCode = () => {
        const threeLengthCode = () => randomString({ length: 3, type: "distinguishable" });
        return `${threeLengthCode()}-${threeLengthCode()}-${threeLengthCode()}`;
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get("http://localhost:3000/api/v1/user/searchDoctor");
                setUsers(response.data);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        let timeoutId;
    
        const countdown = () => {
            setCount(prevCount => prevCount - 1);
            if (count === 1) {
                clearTimeout(timeoutId);
                window.location.href = 'https://online-meet-rosy.vercel.app/';
            }
        };
    
        if (showAlert) {
            timeoutId = setInterval(countdown, 1000);
        }
    
        return () => clearInterval(timeoutId);
    }, [showAlert, count]);

    const handleOnClick = async (email, fullname) => {
        const callId = getRandomCode();
        const callIdString = callId.toString();

        const loggedInPatientEmail = currentUser.data.email;
        const loggedInPatientfullname = currentUser.data.firstName + ' ' + currentUser.data.lastName;

        setShowAlert(true);

        sendDoctorConsult(email, fullname, callIdString)
        sendPatientConsult(loggedInPatientEmail, loggedInPatientfullname, callIdString)

        // await axios.get('https://resend-email-ten.vercel.app/', {
        //     doctorEmail: email,
        //     patientEmail: currentUser.data.email
        // });
        
    };

    const handleSpecialtyChange = (specialty) => {
        setSelectedSpecialty(specialty);
    };

    const filteredUsers = selectedSpecialty === "ALL" ? users : users.filter(user => user.speciality === selectedSpecialty);

    return (
        <div className="bg-gray-100 h-full w-full py-2 mx-auto px-6 relative">
            {showAlert && (
                <div className="ml-96 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mt-4 sticky top-0 z-10 inline-block">
                    <div className="flex items-center">
                        <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6 mr-2">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <p className="font-bold pr-3">Success alert!</p>
                        <p>The Call Id have been sent to your email : {currentUser.data.email}</p>
                    </div>

                    <div className="flex justify-center">
                        <p className="">Redirecting in : {count}</p>
                    </div>
                </div>
            )}

            <div>
                <div className="text-2xl font-medium font-serif p-10 pl-20">
                    <Heading title="Doctors" preText={'Our'}/>
                </div>
                <Flash>
                    <div className="flex justify-around w-100 transition duration-200 ease-in hover:scale-105 item-center">
                        <div className="transition duration-700 ease-in-out transform hover:scale-105 hover:cursor-pointer hover:shadow-2xl hover:shadow-cyan-500  rounded-3xl p-3 bg-white hover:underline ">
                            {["ALL", "CARDIOLOGY", "ORTHOPEDICS", "CONCOLOGY", "DERMETOLOGY", "SURGERY", "GYNOCOLOGY"].map(specialty => (
                                <button key={specialty} 
                                        className={`py-4 px-8 text-xs hover:underline hover:bg-gradient-to-r from-cyan-500 to-blue-500 hover:text-white hover:rounded-2xl hover:mx-1 ${selectedSpecialty === specialty ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-2xl' : ''}`} 
                                        onClick={() => handleSpecialtyChange(specialty)}>
                                    {specialty}
                                </button>
                            ))}
                        </div>
                    </div>
                </Flash>
            </div>

            <Flash>
                <div className="grid grid-cols-5">
                    {filteredUsers.map(user => (
                        user.isAvailable ? <DoctorCard key={user._id} onClick={() => handleOnClick(user.email, user.fullname)} name={user.fullname} email={user.email} description={"Sample Description"} speciality={user.speciality} label={"Consult Now"}/> : <></>
                    ))}
                </div>
            </Flash>
            <div>
                <ChatBotButton />
            </div>
        </div>
    );
};
