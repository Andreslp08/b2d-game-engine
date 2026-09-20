import { motion } from "framer-motion";
type Props = {
	onClick?: () => void;
	text?: string;
};

export const BackButton = (props: Props) => {
	const { onClick, text = "Back" } = props;

	return (
		<motion.button
			key="back-button"
			className="text-xl lg:text-4xl uppercase flex items-center transition-colors duration-300 hover:text-red-400"
			onClick={onClick}
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{duration: 0.5}}
		>
			<svg
				className="mr-3 w-[20px] lg:w-[40px]"
				viewBox="0 0 42 30"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M40 16.7279C41.1046 16.7279 42 15.8325 42 14.7279C42 13.6234 41.1046 12.7279 40 12.7279V14.7279V16.7279ZM0.585785 13.3137C-0.195263 14.0948 -0.195263 15.3611 0.585785 16.1421L13.3137 28.8701C14.0948 29.6511 15.3611 29.6511 16.1421 28.8701C16.9232 28.089 16.9232 26.8227 16.1421 26.0416L4.82843 14.7279L16.1421 3.41421C16.9232 2.63316 16.9232 1.36683 16.1421 0.585785C15.3611 -0.195264 14.0948 -0.195264 13.3137 0.585785L0.585785 13.3137ZM40 14.7279V12.7279H2V14.7279V16.7279H40V14.7279Z"
					fill="currentColor"
				/>
			</svg>
			{text}
		</motion.button>
	);
};
