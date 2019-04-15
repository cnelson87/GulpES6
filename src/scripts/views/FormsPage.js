/**
 * @module FormsPage
 */

import DualDatepicker from 'widgets/DualDatepicker';

const FormsPage = {

	initialize() {
		// DOM elements
		this.form1 = document.getElementById('Form1');
		this.form2 = document.getElementById('Form2');
		this.form3 = document.getElementById('Form3');
		this.form4 = document.getElementById('Form4');
		this.allForms = document.querySelectorAll('form');
		// jQuery elements
		this.$form1 = $(this.form1);
		this.$form2 = $(this.form2);
		this.$form3 = $(this.form3);
		this.$form4 = $(this.form4);
		this.$allForms = $(this.allForms);
		// init date pickers
		new DualDatepicker($('#dual-datepicker-1'));
		new DualDatepicker($('#dual-datepicker-2'));
		// init jQuery validation
		this.$form1.validate();
		this.$form2.validate();
		this.$form3.validate();
		this.$form4.validate();
		// native checkValidity
		console.log('form1 validity:', this.form1.checkValidity());
		console.log('form2 validity:', this.form2.checkValidity());
		console.log('form3 validity:', this.form3.checkValidity());
		console.log('form4 validity:', this.form4.checkValidity());
	}

};

export default FormsPage;
