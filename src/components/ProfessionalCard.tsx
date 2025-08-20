import { motion, useReducedMotion } from "framer-motion";
import { createRipple, rippleClasses } from "../utils/ripple";

interface Props {
  id: string;
  displayName: string;
  title: string;
  email: string;
  photoURL?: string;
}

// Card displaying a professional and linking to their scheduling page
export default function ProfessionalCard({ id, displayName, title, email, photoURL }: Props) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.a
      href={`/agendar/${id}`}
      data-astro-transition="fade"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
      animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onClick={createRipple}
      className={`${rippleClasses} flex items-center gap-4 p-4 bg-card rounded-xl border shadow-sm motion-safe:transition-shadow motion-safe:hover:shadow-md motion-safe:focus:shadow-md`}
    >
      <img
        src={photoURL || '/doctor-placeholder.png'}
        alt={`Foto de ${displayName}`}
        className="w-16 h-16 rounded-full object-cover"
      />
      <div>
        <h2 className="text-lg font-bold text-foreground">{displayName}</h2>
        <p className="text-sm text-muted-foreground">{email}</p>
        <p className="text-sm text-muted-foreground">{title}</p>
      </div>
    </motion.a>
  );
}
