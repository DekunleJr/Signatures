import { Link } from "react-router-dom";
import { optimizeImage } from "../../utils/optimizeImage";
import "./ProjectCard.css";

// One card for Home + Portfolio: title and description are always visible,
// the whole card is a single link, and the like control is a real button.
export default function ProjectCard({ project, width = 600, onLike, canLike }) {
  return (
    <article className='project-card'>
      <img
        className='project-card__img'
        src={optimizeImage(project.img_url, width)}
        alt={`${project.title} interior design project`}
        width={width}
        height={Math.round(width * 0.75)}
        loading='lazy'
        decoding='async'
      />
      <div className='project-card__body'>
        <h3 className='project-card__title'>
          <Link to={`/portfolio/${project.id}`} className='project-card__link'>
            {project.title}
          </Link>
        </h3>
        {project.description && (
          <p className='project-card__desc'>{project.description}</p>
        )}
        <span className='project-card__more' aria-hidden='true'>
          View details →
        </span>
      </div>
      {canLike && (
        <button
          type='button'
          className={`project-card__like ${project.liked_by_user ? "is-liked" : ""}`}
          onClick={() => onLike(project.id, project.liked_by_user)}
          aria-pressed={!!project.liked_by_user}
          aria-label={
            project.liked_by_user
              ? `Remove ${project.title} from liked designs`
              : `Like ${project.title}`
          }
        >
          <span aria-hidden='true'>{project.liked_by_user ? "❤️" : "♡"}</span>
        </button>
      )}
    </article>
  );
}
