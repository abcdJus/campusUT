import { api } from "@/lib/api";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri"] as const;

export default async function TimetablePage() {
  const { items: courses } = await api.getCourses();

  return (
    <main className="page-shell">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Planner</p>
          <h1>Weekly timetable</h1>
        </div>
      </div>
      <section className="timetable-grid" aria-label="Weekly course schedule">
        {days.map((day) => (
          <div className="day-column" key={day}>
            <h2>{day}</h2>
            {courses.flatMap((course) =>
              course.meetings
                .filter((meeting) => meeting.day === day)
                .map((meeting) => (
                  <article className="time-slot" key={`${course.code}-${meeting.day}-${meeting.start}`}>
                    <strong>{course.code}</strong>
                    <span>{meeting.start} - {meeting.end}</span>
                    <small>{meeting.room} · {meeting.instructor}</small>
                  </article>
                ))
            )}
          </div>
        ))}
      </section>
    </main>
  );
}
