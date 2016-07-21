import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { FlowRouter } from 'meteor/kadira:flow-router';

Template.path.onCreated(function pathOnCreated() {
	const terms = Session.get('terms');
	if (!terms || terms.length === 0) {
		FlowRouter.go('home');
	}
	console.log('my terms are ',terms);
});
