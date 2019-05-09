import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';

export default function Header() {
	return (
		<AppBar position="fixed">
			<Toolbar>
				<IconButton color="inherit" aria-label="Menu">
					🍔
				</IconButton>

				<Typography variant="h6" color="inherit">
					Stack Overthrow
				</Typography>

				<div style={{ flex: 1 }} />

				<Button color="inherit" href="/">Deep</Button>
				<Button color="inherit" href="/?depth=0">Shallow</Button>
			</Toolbar>
		</AppBar>
	);
}
