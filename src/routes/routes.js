import express from 'express';
import { Router } from 'express';
import { controller } from '../controllers/index_controller.js'
import { admin_controller } from '../controllers/admin_controller.js'

const router = express.Router();

router.get('/', controller.login_redirect);
router.post('/auth', controller.login_auth);
router.get('/success', controller.get_success)
router.get('/cancel', controller.get_cancel)
router.post('/create_user', controller.register_createUser);
router.post('/create-checkout-session', controller.create_checkout);

router.get('/logout', controller.logout);
router.get('/products', controller.products_noLogin);

router.get('/tables', controller.tables_view)
router.get('/charts', controller.charts_view)
router.get('/register', controller.register_view)

router.get('/tables_ajax', admin_controller.ajax_table_show);
router.put('/tables_ajax/:id', admin_controller.ajax_table_edit);
router.delete('/tables_ajax/:id', admin_controller.ajax_table_delete);




export {router}