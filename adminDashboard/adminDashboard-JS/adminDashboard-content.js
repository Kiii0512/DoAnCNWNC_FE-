class content extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
<div class="content">

    <div class="page-title">Order List</div>
    <div class="breadcrumb"> <a href="#">home</a>/ Order List</div>

    <div class="table-wrapper">
        <table>
            <thead>
                <tr>
                    <th></th>
                    <th>Order ID</th>
                    <th>Customer Name</th>
                    <th>Date</th>
                    <th>Payment Status</th>
                    <th>Total</th>
                    <th>Payment Method</th>
                    <th>Order Status</th>
                    <th>Action</th>
                </tr>
            </thead>

            <tbody>
                <tr>
                    <td><input type="checkbox"></td>
                    <td>#Kc025418</td>
                    <td>Mendocart</td>
                    <td>Mar 24, 2022</td>
                    <td><span class="status-paid">Paid</span></td>
                    <td>$11250</td>
                    <td>Mastercard</td>
                    <td><span class="status-ship">Shipped</span></td>
                    <td class="actions">
                        <button class="edit">✏️</button>
                        <button class="delete">🗑</button>
                    </td>
                </tr>

                <tr>
                    <td><input type="checkbox"></td>
                    <td>#Kc025520</td>
                    <td>Margaret Ak</td>
                    <td>Mar 24, 2022</td>
                    <td><span class="status-paid">Paid</span></td>
                    <td>$8999</td>
                    <td>Visa</td>
                    <td><span class="status-process">Processing</span></td>
                    <td class="actions">
                        <button class="edit">✏️</button>
                        <button class="delete">🗑</button>
                    </td>
                </tr>

            </tbody>
        </table>
    </div>

</div>

      `;
    }
}
customElements.define("con-tent", content);
