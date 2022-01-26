/*
 * This file is part of Cockpit.
 *
 * Copyright (C) 2017 Red Hat, Inc.
 *
 * Cockpit is free software; you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation; either version 2.1 of the License, or
 * (at your option) any later version.
 *
 * Cockpit is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Cockpit; If not, see <http://www.gnu.org/licenses/>.
 */

import cockpit from 'cockpit';
import React, { useState } from 'react';
import { EmptyStatePanel } from "cockpit-components-empty-state.jsx";
import { TableComposable, Thead, Tr, Th, Tbody, Td } from '@patternfly/react-table';

const _ = cockpit.gettext;

const Application = () => {
    const [sensors, setSensors] = useState([]);

    setInterval(() => {
        cockpit.spawn(["sensors", "-j"])
                .then(res => res.replaceAll(/temp\d+_/ig, "temp_"))
                .then(res => JSON.parse(res))
                .then(data => setSensors(Object.entries(data)));
        console.log(sensors);
    }, 5000);

    if (!sensors.length) {
        return <EmptyStatePanel loading />;
    }

    return (
        <TableComposable
            variant='compact'
        >
            <Thead>
                <Tr>
                    <Th>{_("Device")}</Th>
                    <Th>{_("Temperature")}</Th>
                    <Th>{_("Max Temp")}</Th>
                    <Th>{_("Critical Temp")}</Th>
                </Tr>
            </Thead>
            {sensors.map(([key, data]) => (
                <Tbody key={key}>
                    <Tr>
                        <Td>{data.Adapter}</Td>
                    </Tr>
                    {Object.entries(data).filter(([k]) => k !== 'Adapter')
                            .map(([key, value]) => (
                                <Tr key={key}>
                                    <Td>{key}</Td>
                                    <Td>{value.temp_input} ºC</Td>
                                    {value.temp_max ? <Td>{value.temp_max} ºC</Td> : null}
                                    {value.temp_max ? <Td>{value.temp_crit} ºC</Td> : null}
                                </Tr>)
                            )}
                </Tbody>
            ))}
        </TableComposable>
    );
};

export { Application };
