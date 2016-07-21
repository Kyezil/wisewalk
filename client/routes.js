import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';

FlowRouter.route('/', {
	name: 'home',
	action: () => {
		BlazeLayout.render('layout', { main: 'home' });
	}
});

FlowRouter.route('/about', {
	name: 'about',
	action: () => {
		BlazeLayout.render('layout', { main: 'about' });
	}
})
