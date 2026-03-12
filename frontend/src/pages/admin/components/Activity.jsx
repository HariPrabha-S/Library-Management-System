
export default function AdminActivity({ stats }) {

    return (
        <>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-10">

                {/* TODAY ACTIVITY */}
                <div className="bg-white p-6 rounded-2xl shadow-lg">
                    <h2 className="font-heading text-xl mb-6 text-[var(--color-primary)] font-bold">
                        Today’s Activity
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        <div className="bg-gray-200 shadow-lg p-5 rounded-xl">
                            <p className="text-gray-800 text-sm opacity-80  font-medium">
                                Books Returned Today
                            </p>

                            <h3 className="text-2xl font-semibold text-[var(--color-secondary)] mt-2">
                                {stats.issuedToday}
                            </h3>
                        </div>


                        <div className="bg-gray-200 shadow-lg p-5 rounded-xl">
                            <p className="text-gray-800 text-sm opacity-80  font-medium">
                                Books Issued Today
                            </p>
                            <h3 className="text-2xl font-semibold text-[var(--color-secondary)] mt-2">
                                {stats.returnedToday}
                            </h3>
                        </div>

                    </div>
                </div>

                {/* MONTH ACTIVITY */}
                <div className="bg-white p-6 rounded-2xl shadow-lg">
                    <h2 className="font-heading text-xl mb-6 text-[var(--color-primary)] font-bold">
                        Month’s Activity
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        <div className="bg-gray-200 shadow-lg p-5 rounded-xl">
                            <p className="text-gray-800 text-sm opacity-80  font-medium">
                                Books Issued This Month
                            </p>
                            <h3 className="text-2xl font-semibold text-[var(--color-secondary)] mt-2">
                                {stats.issuedMonth}
                            </h3>
                        </div>

                        <div className="bg-gray-200 shadow-lg p-5 rounded-xl">
                            <p className="text-gray-800 text-sm opacity-80  font-medium">
                                Books Returned This Month
                            </p>
                            <h3 className="text-2xl font-semibold text-[var(--color-secondary)] mt-2">
                                {stats.returnedMonth}
                            </h3>
                        </div>

                    </div>
                </div>

            </div>
        </>
    )
}