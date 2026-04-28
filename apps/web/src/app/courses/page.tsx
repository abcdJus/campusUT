import { Search } from "lucide-react";
import { api } from "@/lib/api";

export default async function CoursesPage() {
  const { items: courses } = await api.getCourses();

  return (
    <main className="page-shell narrow">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Courses</p>
          <h1>Course search</h1>
        </div>
      </div>
      <form className="search-row">
        <input name="q" placeholder="Course code, title, department" />
        <button className="icon-button filled" aria-label="Search courses" type="submit">
          <Search size={18} />
        </button>
      </form>
      <div className="data-list">
        {courses.map((course) => (
          <article className="course-row" key={course.code}>
            <div>
              <strong>{course.code}</strong>
              <h2>{course.title}</h2>
              <p>{course.desc}</p>
            </div>
            <div className="course-meta">
              <span>{course.dept}</span>
              <span>{course.delivery}</span>
              <span className={`status ${course.status.toLowerCase().replace(" ", "-")}`}>
                {course.status}
              </span>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
