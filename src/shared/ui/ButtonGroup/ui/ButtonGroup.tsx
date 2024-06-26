import classNames from "classnames";
import React from "react";

import { IButtonGroupProps } from "./ButtonGroup.interface";

import styles from "./ButtonGroup.module.scss";

export const ButtonGroup: React.FC<IButtonGroupProps> = ({
	className,
	...ulProps
}) => {
	return (
		<ul
			{...ulProps}
			className={classNames(styles.group, className)}
		/>
	);
};
