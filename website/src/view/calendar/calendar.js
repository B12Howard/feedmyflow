import React, { useState, useEffect, useRef } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "moment/locale/fr";
import "react-big-calendar/lib/css/react-big-calendar.css";

import CreationModal from "../../components/creationModal/creationModal";
import { Scrollbars } from 'react-custom-scrollbars';
import Header from "../../components/header/header";
import { useTranslation } from 'react-i18next';
import fire from "../../provider/firebase";

import { Colors } from "../../Constants";
import empty from "../../assets/empty.svg";
import "./calendar.css";

const CALENDAR_STYLE = { height: "65vh", width: "100%" };
const CALENDAR_VIEWS = { month: true, week: true };

const localizer = momentLocalizer(moment);

const Mycalendar = (props) => {
  const [eventsList, setEventsList] = useState([]);
  const creationModalRef = useRef();
  const eventsRef = useRef([]);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const currentUser = fire.auth().currentUser;
    const userUid = currentUser.uid;
    const db = fire.firestore();
    var unsubscribeSnapshot = db
      .collection("user")
      .doc(userUid)
      .collection("post")
      .onSnapshot((documents) => {
        let newEventsList = documents.docs.map((query, i) => {
          let data = query.data();
          data["itemId"] = i;
          data["id"] = query.id;
          data["title"] = data.shareCommentary;
          data["start"] = new Date(data.publicationTime.toDate());
          data["end"] = moment(data.start).add(15, "m").toDate();
          return data;
        });
        newEventsList.sort((a, b) => a.start - b.start);
        setEventsList(newEventsList);
        return () => {
          unsubscribeSnapshot();
        };
      });
  }, []);

  // useEffect(() => {
  //   eventsRef.current = eventsRef.current.slice(0, eventsList.length);
  // }, [eventsList]);

  const PostSummary = ({ event }) => (
    <div
      className="next-post"
      key={event.id}
      onClick={() => {
        eventsRef.current[event.itemId].handleOpen();
      }}
    >
      <p className="next-post-item">
        <span className="span-item">{t("calendar.date")}</span>
        {`${event.rawDate} ${event.rawTime}`}
      </p>
      <p className="next-post-item clipped">
        <span className="span-item">{t("calendar.content")}</span>
        {event.title}
      </p>
      <CreationModal
        ref={(r) => (eventsRef.current[event.itemId] = r)}
        event={event}
      />
    </div>
  );

  const NextPosts = () => (
    <div className="column">
      {eventsList.length === 0 ? (
        <img src={empty} alt="empty" className="empty-img" />
      )
        :
        <Scrollbars style={{ width: "44vw", height: "27vw", marginTop: "50px" }}>
          {eventsList.map((event) => (
            <PostSummary event={event} />
          ))}
        </Scrollbars>
      }
    </div>
  );

  const HeaderText = () => (
    <div className="column" style={{ alignItems: "flex-start" }}>
      <p className="important-text">{t("calendar.schedule")}</p>
      <p className="second-text">{t("calendar.automate")}</p>
    </div>
  );

  const messageCalender = () => {
    return {
      allDay: t('calendar.messageCalendar.allDay'),
      previous: t('calendar.messageCalendar.previous'),
      next: t('calendar.messageCalendar.next'),
      today: t('calendar.messageCalendar.today'),
      month: t('calendar.messageCalendar.month'),
      week: t('calendar.messageCalendar.week'),
      day: t('calendar.messageCalendar.day'),
      agenda: t('calendar.messageCalendar.agenda'),
      date: t('calendar.messageCalendar.date'),
      time: t('calendar.messageCalendar.time'),
      event: t('calendar.messageCalendar.event'), // Or anything you want
      showMore: total => t('calendar.messageCalendar.showMore', { total })
    }
  }

  const LeftPart = () => (
    <div className="column" style={{ alignItems: "flex-start" }}>
      <HeaderText />
      <Calendar
        messages={messageCalender()}
        className="calendar"
        popup
        step={60}
        localizer={localizer}
        defaultDate={new Date()}
        defaultView="month"
        culture={i18n.language}
        events={eventsList}
        drilldownView="week"
        style={CALENDAR_STYLE}
        views={CALENDAR_VIEWS}
        selectable
        onSelectSlot={({ start }) => {
          creationModalRef.current.handleOpen(new Date(start));
        }}
        onSelectEvent={(event, e) => {
          eventsRef.current[event.itemId].handleOpen();
        }}
      />
    </div>
  );

  const CreatePost = () => (
    <div
      className="cta-container"
      style={{ backgroundColor: Colors.shade1, margin: "20px" }}
      onClick={() => {
        creationModalRef.current.handleOpen();
      }}
    >
      <p style={{ fontSize: "16px" }} className="cta-text">{t("calendar.create")}</p>
    </div>
  );

  const UpcomingPosts = () => (
    <div
      className="upcoming-container"
      style={{ backgroundColor: Colors.primary }}
    >
      <p className="upcoming-text">{t("calendar.upcoming")}</p>
    </div>
  );

  const RightPart = () => (
    <div className="column" style={{ justifyContent: "flex-start" }}>
      <UpcomingPosts />
      <NextPosts />
      <CreatePost />
      <CreationModal ref={creationModalRef} />
    </div>
  );

  return (
    <>
      <Header {...props} />
      <div className="wrapper">
        <LeftPart />
        <RightPart />
      </div>
    </>
  );
};

export default Mycalendar;
